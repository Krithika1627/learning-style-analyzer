# 📚 AI-Powered Learning Style Analyzer

An intelligent web application that analyzes a user’s learning style using machine learning and generates **personalized study resources** tailored to their preferences.

---

## 🚀 Features

* 🧠 **Learning Style Prediction**

  * Uses a Random Forest ML model to classify users into:

    * Visual
    * Auditory
    * Read/Write
    * Kinesthetic

* 📊 **Assessment System**

  * Questionnaire-based evaluation (VARK model)

* 🎯 **Personalized Resources**

  * Visual → YouTube videos
  * Reading → AI-generated notes (Gemini)
  * Auditory → Text-to-Speech explanations
  * Kinesthetic → Hands-on tasks & real-world activities

* 📅 **Smart Study Planner**

  * NLP-based task parsing
  * Automatic scheduling
  * Calendar view
  * Task tracking + completion

* 🔊 **Auditory Learning Support**

  * Built-in speech synthesis (TTS)

---

## 🏗️ Tech Stack

### Frontend

* Next.js (React)
* Tailwind CSS
* Context API (state management)

### Backend

* FastAPI
* SQLAlchemy
* NLP-based task parser
* Custom scheduling algorithm

### Machine Learning

* Random Forest Classifier
* Trained on VARK-based dataset

### AI Integration

* Google Gemini API (for notes generation)

---

## 📂 Project Structure

```
learning-style-analyzer/
│
├── frontend/        # Next.js app
│   ├── app/
│   ├── components/
│   └── context/
│
├── backend/         # FastAPI server
│   ├── api.py
│   ├── models.py
│   ├── scheduler.py
│   ├── nlp.py
│   └── database.py
│
└── README.md
```

---

## 🧩 System Architecture

Frontend (Next.js) → Backend (FastAPI) → ML Model + NLP Engine → Database (PostgreSQL)

---

## ⚙️ Setup Instructions

### 🔹 1. Clone the Repository

```
git clone https://github.com/Krithika1627/learning-style-analyzer.git
cd learning-style-analyzer
```

---

## 🖥️ Backend Setup (FastAPI)

```
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

### ▶️ Run Backend

```
uvicorn api:app --reload
```

👉 Runs on: http://localhost:8000
👉 API Docs: http://localhost:8000/docs

---

## 🌐 Frontend Setup (Next.js)

```
cd frontend

npm install
npm run dev
```

👉 Runs on: http://localhost:3000

---

## 🔑 Environment Variables

Create `.env.local` file inside frontend/:

```
# 🔑 Gemini API (for notes generation)
GEMINI_API_KEY=your_gemini_api_key

# 🎥 YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# 🔐 Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

```
Create `.env` file inside backend/:

```
DATABASE_URL=your_postgre_url

```

---

## 🔄 Application Flow

1. User logs in
2. Takes assessment
3. ML model predicts learning style
4. Personalized resources are generated
5. User logs study tasks
6. Backend schedules tasks automatically
7. Calendar + tracker display progress

---

## 🧠 Key Highlights

* Combines **Machine Learning + NLP + AI APIs**
* Dynamic scheduling system
* Multi-modal learning support
* Real-time UI updates with backend sync

---

## 📸 Screens (optional)

* Dashboard
* Assessment
* Results
* Resources
* Calendar

---

## 💡 Future Enhancements

* Voice input for tasks 🎙️
* Advanced analytics dashboard 📊
* Adaptive learning recommendations 🤖
* Mobile app version 📱

