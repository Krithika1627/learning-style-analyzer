# Learning Style Analyzer - Setup & Test Instructions

Follow these steps to set up the backend (FastAPI + PostgreSQL) and frontend (Next.js) for the new Calendar and NLP Scheduling feature.

## 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** running on `localhost:5432`

## 2. Backend Setup
1.  **Navigate to backend folder**:
    ```powershell
    cd backend
    ```
2.  **Activate Virtual Environment**:
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
3.  **Install Dependencies**:
    ```powershell
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```
4.  **Database Configuration**:
    - Ensure your PostgreSQL database `learning_style_analyzer` exists.
    - Check [backend/.env](backend/.env) (created during setup) and update `DATABASE_URL` if your password or user differs:
      `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/learning_style_analyzer`
5.  **Run Migrations (Optional)**:
    Since I added `Base.metadata.create_all(bind=engine)` to [backend/api.py](backend/api.py), tables will be created automatically on startup, but you can also use:
    ```powershell
    alembic revision --autogenerate -m "Initial migrations"
    alembic upgrade head
    ```
6.  **Start Backend**:
    ```powershell
    uvicorn api:app --reload
    ```
    *API will be at: `http://localhost:8000`*

## 3. Frontend Setup
1.  **Navigate to frontend folder**:
    ```powershell
    cd frontend
    ```
2.  **Install Dependencies**:
    ```powershell
    npm install
    ```
3.  **Start Frontend**:
    ```powershell
    npm run dev
    ```
    *UI will be at: `http://localhost:3000`*

## 4. Testing the Feature
1.  Open `http://localhost:3000` and click the **Calendar** button in the Navbar.
2.  **Test NLP Parser**:
    In the input box at the top, type:
    > "Finish assignment by Friday 5pm high priority"
3.  **Verify**:
    - The task should appear in the calendar as 1-hour blocks.
    - Check and see if it's color-coded **Red** (High Priority).
4.  **Test Rescheduling**:
    Try adding a task that conflicts:
    > "Study for exam before Friday 2pm high priority"
    *The scheduler should shift existing lower-priority tasks to valid slots.*
5.  **Test Constraints**:
    Add multiple long tasks:
    > "Build large project 6 hours before Monday"
    *The scheduler will respect the 8-hour daily limit and sleep time (10 PM–7 AM).*
