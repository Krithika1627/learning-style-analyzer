import spacy
import dateparser
from datetime import datetime, timedelta
import re

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    nlp = None


def parse_task_input(text: str):
    """
    Parses natural language input to extract task details.
    Example: "Finish assignment by Friday 5pm high priority"
    """

    if not nlp:
        return None

    doc = nlp(text)

    # Defaults
    task_name = text
    deadline = None
    duration = 1  # Default 1 hour
    priority = "medium"
    difficulty = "medium"
    start_time_limit = None
    fixed_time = False   # 🔥 NEW FLAG

    lower_text = text.lower()

    # ------------------------
    # 1. Priority Extraction
    # ------------------------
    priority_keywords = {
        "high": ["high", "urgent", "critical", "important"],
        "medium": ["medium", "normal", "moderate"],
        "low": ["low", "easy", "minor"]
    }

    for p, keywords in priority_keywords.items():
        if any(k in lower_text for k in keywords):
            priority = p
            break

    # ------------------------
    # 2. Difficulty Extraction
    # ------------------------
    difficulty_keywords = {
        "high": ["hard", "difficult", "complex", "challenging"],
        "medium": ["medium", "average"],
        "low": ["simple", "easy"]
    }

    for d, keywords in difficulty_keywords.items():
        if any(k in lower_text for k in keywords):
            difficulty = d
            break

    # ------------------------
    # 3. Duration Extraction
    # ------------------------
    duration_match = re.search(r'(\d+)\s*(hour|hr|hrs)', lower_text)
    if duration_match:
        duration = int(duration_match.group(1))

    # ------------------------
    # 4. Extract FIXED TIME ("at 6 pm")
    # ------------------------
    at_match = re.search(r'at\s+(\d+(?::\d+)?\s*(?:am|pm)?)', lower_text)

    if at_match:
        at_time_str = at_match.group(1)

        parsed_at = dateparser.parse(
            at_time_str,
            settings={'PREFER_DATES_FROM': 'future'}
        )

        if parsed_at:
            start_time_limit = parsed_at
            fixed_time = True   # 🔥 IMPORTANT

    # ------------------------
    # 5. Extract Deadline
    # ------------------------
    deadline_content = ""

    for ent in doc.ents:
        if ent.label_ in ["DATE", "TIME"]:
            deadline_content += ent.text + " "

    if not deadline_content:
        by_match = re.search(r'(?:by|before|on)\s+(.*)', lower_text)
        if by_match:
            deadline_content = by_match.group(1)

    if deadline_content:
        parsed_date = dateparser.parse(
            deadline_content,
            settings={
                'PREFER_DATES_FROM': 'future',
                'RELATIVE_BASE': datetime.now()
            }
        )
        if parsed_date:
            deadline = parsed_date

    # ------------------------
    # 6. Resolve Time Logic
    # ------------------------
    if fixed_time:
        # 🔥 HARD constraint → exact slot
        deadline = start_time_limit + timedelta(hours=duration)

    elif start_time_limit and not deadline:
        # Soft constraint fallback
        deadline = start_time_limit + timedelta(hours=duration)

    # Default deadline
    if not deadline:
        deadline = datetime.now() + timedelta(days=1)

    # ------------------------
    # 7. Clean Task Name
    # ------------------------
    clean_name = text

    # Remove time phrases
    clean_name = re.sub(r'at\s+\d+(?::\d+)?\s*(?:am|pm)?', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'(by|before|on)\s+.*', '', clean_name, flags=re.IGNORECASE)

    # Remove priority/difficulty words
    for keywords in priority_keywords.values():
        for k in keywords:
            clean_name = re.sub(rf'\b{k}\b', '', clean_name, flags=re.IGNORECASE)

    for keywords in difficulty_keywords.values():
        for k in keywords:
            clean_name = re.sub(rf'\b{k}\b', '', clean_name, flags=re.IGNORECASE)

    clean_name = " ".join(clean_name.split())
    if clean_name:
        task_name = clean_name

    # ------------------------
    # FINAL OUTPUT
    # ------------------------
    return {
        "name": task_name,
        "deadline": deadline,
        "start_time_limit": start_time_limit,
        "duration": duration,
        "priority": priority,
        "difficulty": difficulty,
        "fixed_time": fixed_time   # 🔥 KEY ADDITION
    }