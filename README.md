# AI Study Buddy 📚

AI Study Buddy is a high-performance, intelligent learning platform designed to help students organize their studies, generate interactive content from their notes, and stay focused using AI-powered tools.


## ✨ Features

- **📂 Project Management:** Organize your study materials by subject or topic.
- **📝 AI Summarizer:** Automatically generate concise, high-quality summaries from textbooks, notes, or PDFs.
- **🧠 Interactive Quizzes:** Test your knowledge with AI-generated quizzes based on your specific study content.
- **🗂️ Smart Flashcards:** Transform your notes into interactive flashcard sets for better retention.
- **📅 Study Plans:** Generate AI-driven study schedules tailored to your goals.
- **⏱️ Focus Mode:** A distraction-free environment with integrated timers to maximize productivity.
- **📊 Progress Analysis:** Track your learning milestones and mastery across different topics.
- **🌓 Dark/Light Mode:** Premium UI with a dynamic design system that adapts to your preference.

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend/Database:** Firebase (Auth, Firestore, Analytics)
- **AI Engine:** Google Gemini & OpenRouter (OpenAI SDK compatible)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- A Firebase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-study-buddy.git
   cd ai-study-buddy/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `frontend` directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Run local development server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel.

### 1. Root Directory
Ensure the **Root Directory** in your Vercel Project Settings is set to `frontend`.

### 2. Client-Side Routing
The project includes a `vercel.json` file to handle React Router rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. Firebase Authorized Domains
To enable **Google Login** in production:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication > Settings > Authorized Domains**.
3. Add your Vercel URL (e.g., `your-app-name.vercel.app`).

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for students everywhere.
