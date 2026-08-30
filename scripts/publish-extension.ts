import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

async function buildExtension() {
  const zip = new AdmZip();

  const manifest = {
    manifest_version: 3,
    name: "Claude Context Shift",
    version: "1.0",
    description: "Extracts Claude chat history and generates a context file for LLM continuity.",
    permissions: ["activeTab", "scripting", "downloads"],
    action: {
      default_popup: "popup.html"
    },
    host_permissions: [
      "https://claude.ai/*"
    ]
  };

  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 360px; padding: 16px; font-family: system-ui, -apple-system, sans-serif; background: #ffffff; margin: 0; }
    h3 { margin-top: 0; margin-bottom: 8px; font-size: 16px; color: #111827; }
    p { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.4; }
    button { width: 100%; padding: 10px; background: #000000; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; transition: opacity 0.2s; margin-bottom: 8px; }
    button:hover { opacity: 0.8; }
    button:disabled { background: #d1d5db; cursor: not-allowed; color: #6b7280; }
    .secondary-btn { background: #f3f4f6; color: #111827; border: 1px solid #d1d5db; }
    .secondary-btn:hover { background: #e5e7eb; opacity: 1; }
    #status { margin-top: 8px; margin-bottom: 12px; font-size: 13px; color: #4b5563; line-height: 1.4; text-align: center; }
    #results { display: none; margin-top: 12px; }
    
    label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; margin-top: 16px; }
    textarea { width: 100%; padding: 8px; box-sizing: border-box; font-family: monospace; font-size: 11px; border: 1px solid #d1d5db; border-radius: 6px; resize: none; margin-bottom: 8px; }
    #promptOutput { height: 70px; }
    #chatOutput { height: 100px; }
    
    .button-group { display: flex; gap: 8px; }
    .section { background: #f9fafb; padding: 10px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <h3>Claude Context Shift</h3>
  <p>Extract chat history and get the migration prompt for your next AI.</p>
  <button id="captureBtn">Extract Chat Context</button>
  <div id="status"></div>
  
  <div id="results">
    <div class="section">
      <label>1. Instructions for the new AI</label>
      <textarea id="promptOutput" readonly></textarea>
      <button id="copyPromptBtn" class="secondary-btn">Copy Prompt</button>
    </div>
    
    <div class="section">
      <label>2. The Chat Transcript (.txt)</label>
      <textarea id="chatOutput" readonly></textarea>
      <div class="button-group">
        <button id="copyChatBtn" class="secondary-btn">Copy Chat</button>
        <button id="downloadChatBtn">Download .txt</button>
      </div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `
document.addEventListener('DOMContentLoaded', () => {
  let extractedChat = '';
  let migrationPrompt = '';
  
  const captureBtn = document.getElementById('captureBtn');
  const status = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  
  const promptOutput = document.getElementById('promptOutput');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  
  const chatOutput = document.getElementById('chatOutput');
  const copyChatBtn = document.getElementById('copyChatBtn');
  const downloadChatBtn = document.getElementById('downloadChatBtn');

  captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    captureBtn.innerText = 'Capturing...';
    status.innerText = 'Scraping chat...';
    resultsDiv.style.display = 'none';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('claude.ai')) {
        throw new Error('Please open a Claude.ai chat to use this extension.');
      }
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Find the main content area (avoids the sidebar which caused the "Sessions you start" bug)
          const mainArea = document.querySelector('main') || document.querySelector('.flex-1') || document.body;
          
          // Grab message divs. Claude typically uses .prose for its own messages.
          const elements = mainArea.querySelectorAll('.font-user-message, .font-claude-message, .prose, [data-is-user], [data-message-author]');
          
          let text = '';
          if (elements.length > 0) {
            let formattedChat = [];
            const uniqueTexts = new Set();
            
            elements.forEach(el => {
               let role = '--- CLAUDE RESPONSE ---';
               
               if (
                 el.getAttribute('data-is-user') === 'true' || 
                 el.getAttribute('data-message-author') === 'user' || 
                 el.classList.contains('font-user-message')
               ) {
                 role = '--- USER PROMPT ---';
               } else if (el.classList.contains('prose')) {
                 // If this .prose is inside a known wrapper we already selected, skip it to avoid duplication
                 if (el.parentElement && el.parentElement.closest('[data-is-user], [data-message-author], .font-user-message, .font-claude-message')) {
                   return;
                 }
               }

               const t = el.innerText.trim();
               // Filter out empty strings and sidebar noise
               if (t.length > 0 && t !== "Sessions you start will show up here" && !uniqueTexts.has(t)) {
                   uniqueTexts.add(t);
                   formattedChat.push(role + '\\n\\n' + t);
               }
            });
            text = formattedChat.join('\\n\\n=========================================\\n\\n');
          } else {
            // Fallback: grab all text in the main area
            text = mainArea.innerText;
          }
          
          return text.substring(0, 500000); // Limit to ~500k chars to prevent memory issues
        }
      });
      
      const chatText = results[0]?.result;
      
      if (!chatText || chatText.trim().length === 0) {
        throw new Error("Could not find any chat text on this page.");
      }
      
      migrationPrompt = \`I am migrating an active development session from another AI to you.

I will provide the raw chat transcript in my next message (or attached as a text file).

Your first task is to deeply analyze the transcript and construct a comprehensive "Working Memory" for this project.

## INSTRUCTIONS FOR YOU:
1.  **Analyze**: Read through the provided transcript carefully. Ignore any UI noise.
2.  **Create Working Memory**: Create a structured summary of:
    *   **Project Goals:** What are we ultimately trying to build?
    *   **Current State:** Where exactly did we leave off?
    *   **Key Decisions:** What technical choices/frameworks are we using?
    *   **Pending Tasks:** What is the immediate next step or unresolved issue?
3.  **Acknowledge**: Respond ONLY with this "Working Memory" summary. Do NOT start writing code for the next step yet. Wait for my confirmation.\`;
      
      extractedChat = chatText;
      
      promptOutput.value = migrationPrompt;
      chatOutput.value = extractedChat;
      
      resultsDiv.style.display = 'block';
      status.innerText = 'Success! Context extracted.';
      captureBtn.innerText = 'Extract Again';
      captureBtn.disabled = false;
      
    } catch (error) {
      status.innerText = 'Error: ' + error.message;
      captureBtn.innerText = 'Extract Chat Context';
      captureBtn.disabled = false;
    }
  });

  copyPromptBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(migrationPrompt).then(() => {
      const originalText = copyPromptBtn.innerText;
      copyPromptBtn.innerText = 'Copied!';
      setTimeout(() => { copyPromptBtn.innerText = originalText; }, 2000);
    });
  });

  copyChatBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(extractedChat).then(() => {
      const originalText = copyChatBtn.innerText;
      copyChatBtn.innerText = 'Copied!';
      setTimeout(() => { copyChatBtn.innerText = originalText; }, 2000);
    }).catch(err => {
      status.innerText = 'Copy failed: ' + err.message;
    });
  });

  downloadChatBtn.addEventListener('click', () => {
    const blob = new Blob([extractedChat], { type: 'text/plain' });
    const reader = new FileReader();
    reader.onload = function() {
      chrome.downloads.download({
        url: reader.result,
        filename: 'claude-chat-transcript.txt',
        saveAs: true
      });
    };
    reader.readAsDataURL(blob);
  });
});
`;

  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));
  zip.addFile('popup.html', Buffer.from(popupHtml));
  zip.addFile('popup.js', Buffer.from(popupJs));

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  const outPath = path.resolve(publicDir, 'context-shift-extension-v1.zip');
  zip.writeZip(outPath);
  console.log(`Successfully built extension to ${outPath}`);
  console.log("Ready for Chrome Web Store upload!");
}

buildExtension().catch(console.error);
