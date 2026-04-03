import numpy as np
import random
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# --------------------------------------------
# CONFIG
# --------------------------------------------

NUM_QUESTIONS = 25
NUM_SAMPLES = 10000

# --------------------------------------------
# DATASET GENERATION
# --------------------------------------------

def generate_strong_sample():
    dominant = random.randint(0, 3)

    probs = [0.05, 0.05, 0.05, 0.05]
    probs[dominant] = 0.8

    probs = np.array(probs)
    probs = probs / probs.sum()

    answers = np.random.choice(
        [0, 1, 2, 3],
        size=NUM_QUESTIONS,
        p=probs
    )

    label = dominant
    return answers.tolist(), label


def generate_hybrid_sample():
    styles = random.sample([0, 1, 2, 3], 2)
    s1, s2 = styles[0], styles[1]

    probs = [0.05, 0.05, 0.05, 0.05]
    probs[s1] = 0.4
    probs[s2] = 0.4

    probs = np.array(probs)
    probs = probs / probs.sum()

    answers = np.random.choice(
        [0, 1, 2, 3],
        size=NUM_QUESTIONS,
        p=probs
    )

    counts = np.bincount(answers, minlength=4)
    label = np.argmax(counts)

    return answers.tolist(), label


def create_dataset(num_samples):
    X = []
    y = []

    for _ in range(num_samples):
        if random.random() < 0.7:
            answers, label = generate_strong_sample()
        else:
            answers, label = generate_hybrid_sample()

        X.append(answers)
        y.append(label)

    return np.array(X), np.array(y)


# --------------------------------------------
# TRAINING PIPELINE
# --------------------------------------------

def train_and_save_model():
    print("Generating synthetic dataset...")
    X, y = create_dataset(NUM_SAMPLES)

    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("Training Random Forest model...")

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=15,
        random_state=42
    )

    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {round(accuracy * 100, 2)}%")

    print("Saving model as vark_random_forest.pkl...")
    with open("vark_random_forest.pkl", "wb") as f:
        pickle.dump(model, f)

    print("Training complete.")


if __name__ == "__main__":
    train_and_save_model()
