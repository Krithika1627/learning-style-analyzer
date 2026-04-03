from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle

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
