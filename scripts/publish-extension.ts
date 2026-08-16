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
    textarea { width: 100%; height: 150px; padding: 8px; box-sizing: border-box; font-family: monospace; font-size: 12px; border: 1px solid #d1d5db; border-radius: 6px; resize: none; margin-bottom: 12px; }
    .button-group { display: flex; gap: 8px; }
  </style>
</head>
<body>
  <h3>Claude Context Shift</h3>
  <p>Extract the current chat and generate a detailed context markdown file for AI Studio or any LLM.</p>
  <button id="captureBtn">Extract Chat Context</button>
  <div id="status"></div>
  
  <div id="results">
    <textarea id="markdownOutput" readonly></textarea>
    <div class="button-group">
      <button id="copyBtn" class="secondary-btn">Copy Content</button>
      <button id="downloadBtn">Download File</button>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `
document.addEventListener('DOMContentLoaded', () => {
  let generatedMarkdown = '';
  const captureBtn = document.getElementById('captureBtn');
  const status = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  const markdownOutput = document.getElementById('markdownOutput');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

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
          // Find the main scrollable chat container
          const chatContainer = document.querySelector('div.flex-1.overflow-y-auto') || document.body;
          
          // Grab all paragraphs and specific message divs to form the transcript
          // Claude typically uses divs with specific fonts or Tailwind prose classes.
          const elements = chatContainer.querySelectorAll('.font-user-message, .font-claude-message, .prose, [data-is-user], p');
          
          let text = '';
          if (elements.length > 0) {
            const uniqueTexts = new Set();
            elements.forEach(el => {
               const t = el.innerText.trim();
               if (t.length > 0 && !uniqueTexts.has(t)) {
                   uniqueTexts.add(t);
               }
            });
            text = Array.from(uniqueTexts).join('\\n\\n--- [Message Boundary] ---\\n\\n');
          } else {
            text = chatContainer.innerText;
          }
          
          return text.substring(0, 500000); // Limit to ~500k chars to prevent memory issues
        }
      });
      
      const chatText = results[0]?.result;
      
      if (!chatText || chatText.trim().length === 0) {
        throw new Error("Could not find any chat text on this page.");
      }
      
      const fixedPrompt = \`# CONTEXT MIGRATION & CONTINUATION INSTRUCTIONS

You are an expert AI developer assistant. We are migrating an active development session from another AI to you.

Your first task is to deeply analyze the provided chat transcript below and construct a comprehensive "Working Memory" for this project.

## INSTRUCTIONS FOR YOU:
1.  **Analyze**: Read through the entire transcript below carefully. Ignore any noise or duplicated UI text from the scraping process.
2.  **Create Working Memory**: Based on the chat, create a structured summary of:
    *   **Project Goals:** What are we ultimately trying to build?
    *   **Current State:** Where exactly did we leave off?
    *   **Key Decisions & Architecture:** What technical choices have been made? What tools/frameworks are we using?
    *   **Pending Tasks:** What was the immediate next step or unresolved issue when the chat ended?
3.  **Acknowledge & Prepare**: Respond with your "Working Memory" summary to confirm you understand the context. Do NOT start writing code for the next step yet. Wait for my confirmation and my next specific instruction after you provide the summary.

---

# RAW SCRAPED CHAT TRANSCRIPT:

\${chatText}\`;
      
      generatedMarkdown = fixedPrompt;
      markdownOutput.value = generatedMarkdown;
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

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generatedMarkdown).then(() => {
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied!';
      setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
    }).catch(err => {
      status.innerText = 'Copy failed: ' + err.message;
    });
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const reader = new FileReader();
    reader.onload = function() {
      chrome.downloads.download({
        url: reader.result,
        filename: 'claude-chat-context.md',
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

  const outPath = path.resolve(process.cwd(), 'context-shift-extension-v1.zip');
  zip.writeZip(outPath);
  console.log(`Successfully built extension to ${outPath}`);
  console.log("Ready for Chrome Web Store upload!");
}

buildExtension().catch(console.error);
