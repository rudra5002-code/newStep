# 🚀 NextStep

> Don't figure out everything. Just figure out what to do next.

NextStep is a simple productivity and focus web app built to help people who feel overwhelmed by too many tasks or are unsure about what they should work on next.

I built NextStep for a friend who often knew he had a lot to do, but struggled to decide **what to do first**.

The goal was simple: turn confusion into a clear next step.

---

## 🌐 Live Demo

https://newstep2.onrender.com

## 💻 Source Code

https://github.com/rudra5002-code/newStep

---

## 💡 The Problem

When everything feels important at the same time, it can become difficult to decide where to start.

My friend often had multiple tasks, study goals, and things to finish, but the hardest part was simply figuring out:

> **"What should I do next?"**

Instead of building another complicated productivity system, I wanted to create something that makes starting easier.

That's why I built NextStep.

---

## ✨ Features

### 📝 Capture Thoughts

Quickly dump tasks and thoughts without worrying about organizing everything first.

NextStep turns those thoughts into manageable tasks that can be prioritized and completed.

### ⭐ Task Prioritization

Tasks can be organized based on:

* Importance
* Timing
* Completion status

This helps the user understand what deserves attention first.

### ⏱️ Focus Mode

NextStep includes focused work sessions inspired by the **Pomodoro technique**.

Instead of thinking about the entire workload, the user can focus on one task for a dedicated sprint.

### 📊 Progress Tracking

NextStep tracks:

* Completed tasks
* XP
* Focus minutes
* Overall progress

This gives the user a simple way to see their momentum.

### 🤖 AI Coach

When a user feels confused about a goal or doesn't know where to begin, they can describe their situation to the AI Coach.

The AI Coach is powered by **Google's Gemma model** and turns the situation into **three small, actionable next steps**.

For example:

> "I have an exam tomorrow, five chapters left, and I don't know where to start."

The AI Coach can break that overwhelming situation into three practical actions.

### ➕ AI Steps → Tasks

Every AI-generated step can be added directly to the NextStep task list with one click.

This connects AI guidance directly to the productivity workflow.

---

## 🤖 AI Coach — Powered by Gemma

The AI Coach is a core feature of NextStep.

It uses:

* **Google Gemma**
* **Hugging Face Inference Providers**
* **Featherless AI**
* **Node.js + Express**

The model used by the application is:

```text
google/gemma-2-2b-it
```

The AI is not just used as a general chatbot.

Its purpose is specific:

**Take an overwhelming situation → reduce the confusion → provide three actionable next steps.**

### AI Workflow

```text
User's situation
       ↓
   AI Coach
       ↓
     Gemma
       ↓
3 actionable steps
       ↓
 Add as tasks
       ↓
 Start working
```

---

## 🧑‍🤝‍🧑 Built for a Friend

I built NextStep specifically for a friend who struggled with productivity.

He often knew what needed to be done, but when there were many things to handle at once, deciding what to do first became difficult.

NextStep was designed around that problem.

It helps him:

1. Get everything out of his head.
2. Understand what is important.
3. Choose the next task.
4. Focus on it using a work sprint.
5. Ask the AI Coach for guidance when he is confused about a goal.

The idea behind the project is:

> **Don't figure out everything. Just figure out what to do next.**

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* LocalStorage

### Backend

* Node.js
* Express.js

### AI

* Google Gemma
* Hugging Face Inference Providers
* Featherless AI

### Deployment

* Render

---

## 🏗️ Project Structure

```text
newStep/
└── nextStep/
    ├── index.html
    ├── style.css
    ├── app.js
    ├── server.js
    ├── package.json
    └── README.md
```

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/rudra5002-code/newStep.git
```

### 2. Enter the project directory

```bash
cd newStep/nextStep
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure the Hugging Face token

The AI Coach requires a Hugging Face access token.

Create an environment variable:

```text
HF_TOKEN=your_hugging_face_token
```

**Do not commit your real token to GitHub.**

### 5. Start the application

```bash
npm start
```

The application will run locally at:

```text
http://localhost:10000
```

---

## 🔐 Environment Variables

| Variable   | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `HF_TOKEN` | Hugging Face token used by the backend to access the Gemma model |

The Hugging Face token should remain on the server side.

Never put the real token directly inside:

* `app.js`
* `index.html`
* `style.css`
* GitHub repository files

For deployment, configure `HF_TOKEN` using the hosting platform's environment variables.

---

## 🌐 Deployment

NextStep is deployed using **Render**.

The Node.js/Express backend serves the frontend and handles requests to the AI Coach.

### Production Flow

```text
User
 ↓
NextStep Frontend
 ↓
Express Backend
 ↓
Hugging Face Inference API
 ↓
Gemma
 ↓
3 actionable steps
 ↓
NextStep Task List
```

---

## 🌱 Why Open Innovation Matters

Open-weight AI makes it possible for independent developers to build useful AI experiences without needing to train a large model from scratch.

For NextStep, Gemma makes it possible to add an AI Coach that helps users turn confusing goals into practical actions.

The important part isn't simply adding AI.

It is using AI where it solves a real problem.

In NextStep, AI is directly connected to the productivity workflow:

**Confusion → AI guidance → Action → Task → Focus**

---

## 🎯 Design Philosophy

NextStep intentionally keeps the productivity workflow simple.

Instead of asking:

> "How can I finish everything?"

NextStep encourages the user to ask:

> **"What is my next step?"**

The project combines:

* Task prioritization
* Focused work sessions
* Progress tracking
* AI-powered guidance

into one lightweight workflow.

---

## 🔮 Future Improvements

Some ideas for future versions include:

* AI-generated daily plans
* Smarter task prioritization
* Personalized focus sessions
* Better progress insights
* AI-powered goal breakdown
* User accounts and cloud synchronization
* More personalized AI coaching modes

---

## 🏆 Hacktoberfest Weekend Challenge

This project was built for the **DEV.to Hacktoberfest Weekend Challenge — Build for a Friend**.

The project focuses on solving a real productivity problem for a friend while using open-weight AI as a core part of the experience.

---

## 📜 License

This project is open source and available for learning, experimentation, and further development.
