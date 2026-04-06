from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import numpy as np
import pickle
from datetime import datetime, timedelta
from database import get_db, engine
from models import Base, Task, ScheduleEntry, Resource
from nlp import parse_task_input
from scheduler import recompute_schedule, get_weekly_schedule

# Initialize tables (optional if using Alembic)
Base.metadata.create_all(bind=engine)

# --------------------------------------------
# LOAD TRAINED MODEL
# --------------------------------------------

with open("vark_random_forest.pkl", "rb") as f:
    model = pickle.load(f)

STYLE_NAMES = ["Visual", "Auditory", "Read/Write", "Kinesthetic"]

# --------------------------------------------
# CREATE FASTAPI APP
# --------------------------------------------

app = FastAPI()

# Allow frontend (Next.js) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------
# REQUEST SCHEMA
# --------------------------------------------

class QuizInput(BaseModel):
    answers: list  # expects list of 25 integers

class TaskInput(BaseModel):
    text: str


class ResourceInput(BaseModel):
    topic: str
    learning_style: str
    content: str
    type: str

# --------------------------------------------
# CALENDAR & TASK ENDPOINTS
# --------------------------------------------

@app.post("/tasks")
def add_task(input: TaskInput, db: Session = Depends(get_db)):
    """
    NLP Parse → Store Task → Recompute Schedule
    """
    parsed = parse_task_input(input.text)

    if not parsed:
        # 🔥 fallback (VERY IMPORTANT)
        parsed = {
            "name": input.text,
            "deadline": datetime.now() + timedelta(days=1),
            "duration": 60,
            "priority": "medium",
            "difficulty": "medium"
    }
    
    new_task = Task(
        name=parsed["name"],
        deadline=parsed["deadline"],
        start_time_limit=parsed.get("start_time_limit"),
        fixed_time=1 if parsed.get("fixed_time") else 0,
        duration=parsed["duration"],
        priority=parsed["priority"],
        difficulty=parsed["difficulty"]
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # Recompute the entire schedule
    recompute_schedule(db)
    
    return {"message": "Task added and schedule updated", "task": parsed}

@app.get("/schedule")
def get_schedule(start_date: str = None, db: Session = Depends(get_db)):
    """
    Fetch schedule for current week
    """
    if start_date:
        # start_date from frontend is ISO string, e.g. 2026-03-30T00:00:00.000Z
        # Remove 'Z' for fromisoformat if it exists
        clean_date = start_date.replace('Z', '+00:00')
        start_dt = datetime.fromisoformat(clean_date).replace(tzinfo=None)
    else:
        # Default to Monday of current week
        now = datetime.now()
        start_dt = now - timedelta(days=now.weekday())
        start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    
    schedule = get_weekly_schedule(db, start_dt)
    return schedule

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

@app.patch("/schedule/{entry_id}/complete")
def complete_task(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(ScheduleEntry).filter(ScheduleEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    entry.status = "completed"
    db.commit()
    return {"message": "Task marked as completed"}


@app.post("/resources")
def save_resource(input: ResourceInput, db: Session = Depends(get_db)):
    new_resource = Resource(
        topic=input.topic,
        learning_style=input.learning_style,
        content=input.content,
        type=input.type,
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)

    return {
        "id": new_resource.id,
        "topic": new_resource.topic,
        "learning_style": new_resource.learning_style,
        "content": new_resource.content,
        "type": new_resource.type,
        "created_at": new_resource.created_at,
    }


@app.get("/resources")
def get_resources(db: Session = Depends(get_db)):
    resources = db.query(Resource).order_by(Resource.created_at.desc(), Resource.id.desc()).all()

    return [
        {
            "id": item.id,
            "topic": item.topic,
            "learning_style": item.learning_style,
            "content": item.content,
            "type": item.type,
            "created_at": item.created_at,
        }
        for item in resources
    ]


# --------------------------------------------
# INTERPRETATION LOGIC
# --------------------------------------------

def interpret_results(probabilities):
    probs = np.array(probabilities)
    percentages = [round(p * 100, 2) for p in probs]

    dominant_index = np.argmax(probs)
    dominant_style = STYLE_NAMES[dominant_index]

    sorted_indices = np.argsort(probs)[::-1]
    top1 = sorted_indices[0]
    top2 = sorted_indices[1]

    hybrid = False
    secondary_style = None

    # Hybrid rule
    if (probs[top1] - probs[top2] < 0.05) or (probs[top1] < 0.40):
        hybrid = True
        secondary_style = STYLE_NAMES[top2]

    return {
        "dominant_style": dominant_style,
        "percentages": dict(zip(STYLE_NAMES, percentages)),
        "hybrid": {
            "is_hybrid": hybrid,
            "secondary_style": secondary_style
        }
    }


# --------------------------------------------
# PREDICTION ENDPOINT
# --------------------------------------------

@app.post("/predict")
def predict_style(data: QuizInput):

    # Validate length
    if len(data.answers) != 25:
        return {"error": "Exactly 25 answers are required."}

    answers = np.array(data.answers)

    probabilities = model.predict_proba([answers])[0]
    result = interpret_results(probabilities)

    return result
