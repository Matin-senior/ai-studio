# AI Studio 🧠

> The Operating System for Your Thoughts.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/YOUR_USERNAME/ai-studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange)](https://github.com/YOUR_USERNAME/ai-studio)

AI Studio is a local-first desktop platform designed for deep, stateful collaboration between humans and AI agents. It's built not just to be another interface for LLMs, but to become a true intellectual partner—an extension of your own mind.

---

## 🚀 The Vision: Beyond a Simple Chatbot

Today's AI assistants are powerful, but they suffer from a fundamental flaw: they have no memory. They are stateless calculators, unable to maintain context, learn from past interactions, or engage in long-term reasoning. AI Studio was born to solve this problem.

Our long-term vision is to implement and perfect the **Extended Context Recycling (XCR) Loop**, a novel architecture that provides AI agents with true long-term, stateful memory. By using a **Volumetric Data Model**, AI Studio will enable agents to:

-   **Transcend context window limitations** of offline models.
-   **Learn and evolve** from every interaction.
-   **Maintain coherent, long-form reasoning** across days, weeks, and months.
-   **Develop a genuine understanding** of you and your projects.

The ultimate goal is to create a testbed for **Personal AGI**—an AI-native operating system where the AI is not just an application you run, but the core fabric of the entire user experience.

---

## ✨ Core Features (Current & Planned)

-   **Local-First AI:** Connects to and runs local LLMs via Ollama for 100% privacy and offline capability.
-   **Multi-Model Management:** Seamlessly switch between different local models like Llama 3, Phi-3, and Mistral.
-   **Advanced Analytics:** A built-in dashboard to monitor your AI agents' performance, accuracy, and error rates.
-   **Extensible Platform (Planned):** A robust extension API that allows developers to build new tools, agents, and workflows on top of AI Studio.
-   **Stateful Long-Term Memory (XCR Loop - Planned):** The core revolutionary engine that will give your AI a persistent memory.

---

## 🚦 Current Status: Pre-Alpha

AI Studio is currently in a very early, **experimental, pre-alpha stage**.

-   **What Works:** The core UI shell (built with React/Vite/Electron) is in place. Basic, stateless connections to Ollama models are functional for simple chat.
-   **What's in Development:** We are actively architecting and building the **Core API**, which will act as the central nervous system for the entire application and pave the way for the XCR Loop and the extension system.

---

## 🛠️ Getting Started (Testing the Current Build)

You can test the current state of the application on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Git](https://git-scm.com/)
-   [Ollama](https://ollama.com/) installed and running with at least one model pulled (e.g., `ollama run llama3`).

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Matin-senior/ai-studio.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd ai-studio
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the application in development mode:**
    > **Note:** This is the primary command for testing the current build.
    ```bash
    npm run electron:start
    ```

---

## 🗺️ Roadmap

Our development is planned in four distinct phases:

1.  **Phase 1: The Core Application (In Progress)**
    -   Build a stable, polished AI Studio application with a robust Core API for managing models and chats.
    -   Initial public release.

2.  **Phase 2: The Platform & Extensions**
    -   Develop and release the `ExtensionManager` API and SDK for third-party developers.
    -   Foster a community and build a library of useful extensions.

3.  **Phase 3: XCR Loop Integration**
    -   Implement the first version of the XCR Loop and the Volumetric Data Model to bring true memory to the agents.

4.  **Phase 4: The AI OS Vision**
    -   Use the mature platform as the foundation for building a standalone, AI-native operating system.

---

## 🤝 Contributing

We are at the very beginning of a long and exciting journey. Contributions of all kinds are welcome. If you are a developer, designer, AI researcher, or just someone passionate about the future of human-AI collaboration, we'd love to have you on board.





Made by ❤️ 
Matin Sanei
Please read our `CONTRIBUTING.md` file (coming soon) and check out the issue tracker to get started.

---

## 📄 License

This project is currently under a proprietary license during its early development. A decision on a future open-source license (likely MIT) will be made before the first major public release.
