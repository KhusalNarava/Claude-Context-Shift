/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Download, Chrome, FileText, Code, Moon, Sun, Brain, ShieldCheck, FileJson, Link2, Check, HelpCircle, Copy, Star, AlertTriangle, MessageSquare, Shield, X } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [browserName, setBrowserName] = useState('Chrome');

  useEffect(() => {
    // Check initial preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
    
    // Detect browser for tailored CTA
    const detectBrowser = async () => {
      try {
        // @ts-ignore - non-standard API
        if (navigator.brave && await navigator.brave.isBrave()) {
          return 'Brave';
        }
      } catch (e) {}
      
      const ua = navigator.userAgent;
      if (ua.includes('Edg/')) return 'Edge';
      if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
      if (ua.includes('Chrome/')) return 'Chrome';
      
      return 'Chromium';
    };
    
    detectBrowser().then(name => setBrowserName(name));
  }, []);

  const copyLandingPageLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, []);

  const copyMigrationPrompt = useCallback(() => {
    const promptText = `# CONTEXT MIGRATION & CONTINUATION INSTRUCTIONS

You are an expert AI developer assistant. We are migrating an active development session from another AI to you.

Your first task is to deeply analyze the provided chat transcript below and construct a comprehensive "Working Memory" for this project.

## INSTRUCTIONS FOR YOU:
1.  **Analyze**: Read through the entire transcript below carefully. Ignore any noise or duplicated UI text from the scraping process.
2.  **Create Working Memory**: Based on the chat, create a structured summary of:
    *   **Project Goals:** What are we ultimately trying to build?
    *   **Current State:** Where exactly did we leave off?
    *   **Key Decisions & Architecture:** What technical choices have been made? What tools/frameworks are we using?
    *   **Pending Tasks:** What was the immediate next step or unresolved issue when the chat ended?
3.  **Acknowledge & Prepare**: Respond with your "Working Memory" summary to confirm you understand the context. Do NOT start writing code for the next step yet. Wait for my confirmation and my next specific instruction after you provide the summary.`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key.toLowerCase() === 'd') {
        setIsDark(prev => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        copyLandingPageLink();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyLandingPageLink]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 transition-colors duration-200">
      
      {/* Header / Theme Toggle */}
      <header className="max-w-4xl mx-auto px-6 py-6 flex justify-end gap-3">
        <button 
          onClick={copyLandingPageLink}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors text-sm font-medium"
          aria-label="Copy Landing Page Link (Shortcut: C)"
          title="Copy Link (C)"
        >
          {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
        </button>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors"
          aria-label="Toggle Dark Mode (Shortcut: D)"
          title="Toggle Dark Mode (D)"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24 sm:pb-32 pt-12 sm:pt-20">
        
        {/* Hero Section */}
        <div className="space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 text-sm font-medium">
            <Chrome className="w-4 h-4" />
            Chrome Extension
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-white">
            Claude Context Shift
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Seamlessly migrate your chat context from Claude to any other LLM interface. 
            Extract the full conversation and instantly generate a high-quality Markdown "Working Memory" for flawless continuation.
          </p>
          
          <div className="pt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <a 
                href="/api/download-extension"
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors focus:ring-4 focus:ring-neutral-200 dark:focus:ring-neutral-800"
              >
                <Download className="w-5 h-5" />
                Download for {browserName} (.zip)
              </a>
              <button 
                onClick={copyMigrationPrompt}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200/60 dark:border-neutral-800 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 shadow-sm"
              >
                {copiedPrompt ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copiedPrompt ? 'Prompt Copied!' : 'Copy Sample Prompt'}
              </button>
            </div>
            
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Works perfectly on Chrome, Brave, Edge, and other Chromium-based browsers.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Markdown Support</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Generates a clean, beautifully formatted Markdown file containing your entire chat history, ready to be pasted or uploaded into any LLM.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Working Memory</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Includes a highly detailed, pre-written meta-prompt instructing the new AI to parse the transcript and build an accurate "Working Memory" of the project state.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Local Processing</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              100% secure and private. The extension runs entirely within your browser, directly scraping the DOM without sending your chat data to any third-party servers.
            </p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-32">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Loved by developers</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">See how others are speeding up their workflow.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 italic">"I constantly switch between Claude for brainstorming and Cursor for coding. This tool perfectly captures the context without me having to manually copy-paste everything. Absolute lifesaver."</p>
              <div className="font-medium text-sm text-neutral-900 dark:text-white">— Sarah J., Full-Stack Developer</div>
            </div>
            
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 italic">"The Working Memory prompt it generates is genius. My new LLM immediately understands exactly where I left off. It's like continuing a conversation seamlessly."</p>
              <div className="font-medium text-sm text-neutral-900 dark:text-white">— David M., AI Researcher</div>
            </div>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="mt-32">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">How it works</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                <Chrome className="w-3.5 h-3.5" />
                Chrome
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Brave
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-4.5 4 4 0 0 1-5 4.5"/></svg>
                Edge
              </span>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">1. Download & Extract</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Click the button above to download the Chrome Extension ZIP file, then extract it to a folder on your computer.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">2. Load Unpacked</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Open <code className="bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs text-neutral-800 dark:text-neutral-200">chrome://extensions</code>, enable <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select the extracted folder.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">3. Extract Context</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Open a chat in Claude, click the new extension icon in your toolbar, and instantly download a highly detailed context markdown file.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="w-6 h-6 text-neutral-900 dark:text-white" />
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Is my chat history private?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Yes. The extension runs entirely in your browser and processes the DOM locally. It does not send any of your chat data to external servers or APIs.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Does this work with other LLMs?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Yes! While it extracts specifically from Claude, the generated Markdown "Working Memory" is designed to be pasted directly into AI Studio, ChatGPT, Gemini, or any other LLM context window to perfectly resume your session.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">How do I update the extension?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Simply download the latest `.zip` file from this page, extract it over your existing folder, and click the "Update" or "Reload" icon on the extension card in your <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs text-neutral-800 dark:text-neutral-200">chrome://extensions</code> page.
              </p>
            </div>
          </div>
        </div>
        
        {/* Troubleshooting Section */}
        <div className="mt-32">
          <div className="flex items-center gap-2 mb-8">
            <AlertTriangle className="w-6 h-6 text-neutral-900 dark:text-white" />
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Troubleshooting</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Extension icon not appearing?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Make sure you have pinned the extension. Click the "puzzle piece" icon in the top right of your browser toolbar, find "Claude Context Shift", and click the pin icon next to it.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Getting a permission error?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                The extension needs permission to read the current tab to extract the chat text. Ensure you are actually on a <code>claude.ai</code> page when clicking the button, as the script is restricted to active chat tabs.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">"Load unpacked" button is missing?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                You must toggle on "Developer mode" in the top right corner of the <code>chrome://extensions</code> page before the "Load unpacked" button will appear.
              </p>
            </div>
          </div>
        </div>
        
        {/* Architecture Note */}
        <div className="mt-24 grid sm:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Secure & Client-Side</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The Chrome Extension runs entirely in your browser. It securely scrapes the chat text and instantly generates a highly-detailed prompt to guide the new LLM to create a "Working Memory" for perfect context migration. No data is sent to any external server.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Coming Soon
              </span>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Web Store Ready</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We've implemented a unified build pipeline (<code>npm run build:extension</code>) to bundle the extension instantly. Once approved by Google, the download button will route directly to the Chrome Web Store for a 1-click install.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-500">
        <p>© {new Date().getFullYear()} Context Shift. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsPrivacyModalOpen(true)}
            className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            Privacy Policy
          </button>
          <a 
            href="mailto:support@example.com?subject=Claude Context Shift Feedback"
            className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            Feedback / Report Issue
          </a>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsPrivacyModalOpen(false)}>
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white inline-flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-neutral-500" />
                Privacy Policy
              </h2>
              <button 
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                <strong>We respect your privacy implicitly.</strong> By design, Claude Context Shift is completely secure and operates entirely on your local machine.
              </p>
              <h3 className="font-medium text-neutral-900 dark:text-white pt-2">Local Processing Only</h3>
              <p>
                The extension works by directly reading the Document Object Model (DOM) of your active Claude browser tab. All text extraction, markdown formatting, and file generation happen in the client-side JavaScript environment of your browser.
              </p>
              <h3 className="font-medium text-neutral-900 dark:text-white pt-2">No Tracking or Telemetry</h3>
              <p>
                No data is ever sent to any third-party servers, databases, or APIs. We do not track your usage, nor do we collect analytics or crash reports. Your confidential chats remain exclusively yours.
              </p>
              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button 
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="w-full px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors focus:ring-4 focus:ring-neutral-200 dark:focus:ring-neutral-800"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
