# Claude Context Shift

> Move an active Claude conversation to another AI without losing the project context you built up.

**Claude Context Shift** is a privacy-first browser extension and web app that extracts the current Claude.ai conversation and turns it into a portable Markdown context package for continuing the work in another LLM.

The goal is simple: **stop losing hours of context every time you switch AI tools.**

## 🚀 Live Demo

**Website:** https://claudecontextshift.vercel.app/

**GitHub:** https://github.com/KhusalNarava/Claude-Context-Shift

## ✨ What it does

Claude Context Shift captures the active Claude chat and generates a structured context document containing:

* The scraped conversation transcript
* Clear message boundaries for easier parsing
* A built-in **Working Memory** migration prompt
* Project goals and current-state extraction instructions
* Key technical decisions and architecture
* Pending tasks and unresolved issues
* Instructions for the next AI to understand the project before writing more code

The generated Markdown can then be copied into, or uploaded to, another LLM such as Cursor, Gemini, Google AI Studio, or another compatible AI coding environment.

## 🧠 The idea

AI coding sessions accumulate a huge amount of hidden context: decisions, debugging history, architecture choices, assumptions, unfinished tasks, and project-specific knowledge.

When you switch from Claude to another model, most of that context is normally lost.

Claude Context Shift treats the conversation as a **portable project memory layer**:

```text
Claude.ai session
       ↓
Extract conversation
       ↓
Generate portable Markdown
       ↓
Working Memory prompt
       ↓
New LLM understands the project
       ↓
Continue building
```

## 🔐 Privacy-first by design

The browser extension performs the chat extraction directly in the browser by reading the Claude.ai page DOM. The generated context is assembled in the extension flow without sending the conversation to an external AI processing service.

The extension requests the browser capabilities it needs for Claude.ai, including active-tab access, scripting, and downloads.

> **Note:** Extraction depends on Claude's current page structure. Changes to Claude.ai's frontend DOM may require updates to the extraction selectors.

## 🧩 How it works

### 1. Open a Claude conversation

Go to a Claude.ai conversation containing the project or task you want to migrate.

### 2. Extract the chat

Open the Claude Context Shift extension and click **Extract Chat Context**.

The extension reads the conversation content from the page and assembles it into a transcript.

### 3. Generate Working Memory

The tool wraps the transcript inside a migration prompt that asks the next AI to identify:

* **Project Goals** — what is being built
* **Current State** — where the session ended
* **Key Decisions & Architecture** — important technical choices
* **Pending Tasks** — what should happen next

The next AI is instructed to understand and acknowledge the working memory before continuing implementation.

### 4. Continue in another LLM

Copy or download the generated Markdown and provide it to the next AI.

You can use the output with tools such as:

* Cursor
* Google AI Studio
* Gemini
* Other LLM interfaces that accept Markdown/text context
  

## 🛠️ Tech Stack

* **Frontend:** React 19 + TypeScript
* **Build tool:** Vite
* **Server:** Node.js + Express
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Animation:** Motion
* **Extension:** Chrome Manifest V3
* **Packaging:** Adm-Zip
* **Runtime tooling:** TSX + esbuild

The project combines a React/Vite frontend with an Express server. The server also exposes an endpoint that dynamically builds and downloads the browser extension ZIP.

## 📁 Project structure

```text
Claude-Context-Shift/
├── src/                         # React application
├── scripts/                     # Extension/build scripts
├── assets/                      # Project assets
├── server.ts                    # Express server + extension generator
├── index.html                   # App entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Scripts and dependencies
├── .env.example                 # Environment variable template
└── context-shift-extension-v1.zip
```

## 💻 Run locally

### Prerequisites

* Node.js
* npm or Bun

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The development server runs through the Express + Vite setup.

### Production build

```bash
npm run build
```

### Start the production server

```bash
npm start
```

### Type-check the project

```bash
npm run lint
```

### Build the extension package

```bash
npm run build:extension
```


## 🧩 Install the extension manually

1. Download the extension ZIP from the website.
2. Extract the ZIP into a local folder.
3. Open:

```text
chrome://extensions
```

4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted extension folder.
7. Open a Claude.ai conversation.
8. Click the extension and choose **Extract Chat Context**.

The generated extension uses **Manifest V3** and targets `https://claude.ai/*`.


## 📦 What gets generated

The server-generated extension package contains:

```text
manifest.json
popup.html
popup.js
```

The popup provides actions to:

* Extract the current Claude conversation
* Preview the generated Markdown
* Copy the context to the clipboard
* Download the context as `claude-chat-context.md`
  

## ⚠️ Current limitations

* Extraction currently depends on Claude.ai's DOM structure.
* Very large chats are capped at roughly 500,000 characters during extraction.
* The current workflow focuses on Claude → another LLM rather than bidirectional context synchronization.
* The extension is designed for Chromium-based browsers.
  

## 🗺️ Future direction

Claude Context Shift can evolve from a simple migration utility into a broader **AI context portability layer**.

Potential directions include:

* Claude ↔ Cursor ↔ Gemini ↔ ChatGPT context transfers
* Automatic project-state compression
* Smarter conversation summarization
* Persistent project memory
* One-click context injection into supported AI tools
* Git-aware project state reconstruction
* Context diffing between AI sessions
* Browser extension support across more AI platforms
* Automatic recovery of unfinished tasks and decisions

The larger vision is to make **AI context portable**, so users can choose the best model for each step of a project without rebuilding the conversation from scratch.


## 🤝 Contributing

Contributions, ideas, bug reports, and experiments are welcome.

Useful contributions include:

1. Finding extraction issues caused by Claude UI changes
2. Improving context parsing
3. Adding support for another AI platform
4. Improving the Working Memory prompt
5. Adding tests or developer tooling
6. 

## 📄 License

The application source includes an Apache-2.0 license header. Review the repository's licensing configuration before redistributing the project as a packaged product.


## ⭐ Built for the multi-model future

Claude Context Shift is built around a simple belief:

> **Your work should not be trapped inside one AI model.**

Models change. Tools change. Your project context should move with you.
