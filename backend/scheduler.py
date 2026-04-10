from datetime import datetime, timedelta, time
from sqlalchemy.orm import Session
from models import Task, ScheduleEntry
from typing import List

# ------------------------
# CONFIG
# ------------------------
MAX_DAILY_HOURS = 8
MAX_TASK_HOURS_PER_DAY = 2

CHUNK_SIZE = 2
BREAK_AFTER_BLOCK = 1  # 1 hour break

UNAVAILABLE_START = time(22, 0)  # 10 PM
UNAVAILABLE_END = time(7, 0)     # 7 AM

MEAL_TIMES = [
    (time(8, 0), time(9, 0)),
    (time(13, 0), time(14, 0)),
    (time(20, 0), time(21, 0)),
]


# ------------------------
# TIME FILTER
# ------------------------
def is_within_work_hours(dt: datetime) -> bool:
    current_time = dt.time()

    if current_time >= UNAVAILABLE_START or current_time < UNAVAILABLE_END:
        return False

    for start, end in MEAL_TIMES:
        if start <= current_time < end:
            return False

    return True


# ------------------------
# MAIN SCHEDULER
# ------------------------
def recompute_schedule(db: Session):

    priority_map = {"high": 3, "medium": 2, "low": 1}

    tasks = db.query(Task).all()

    tasks.sort(key=lambda t: (
        not t.fixed_time,
        t.deadline,
        -priority_map.get(t.priority, 2)
    ))

    # Clear old schedule
    db.query(ScheduleEntry).filter(
        ScheduleEntry.status != "completed"
    ).delete()

    now = datetime.now()
    current_slot = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

    daily_hours = {}

    # 🔥 CRITICAL FIX: track occupied slots in-memory
    occupied_slots = set()

    for task in tasks:

        duration_left = task.duration
        task_daily_hours = {}

        # ------------------------
        # FIXED TIME TASK
        # ------------------------
        if task.fixed_time and task.start_time_limit:
            start = task.start_time_limit.replace(minute=0, second=0, microsecond=0)

            for i in range(duration_left):
                slot = start + timedelta(hours=i)

                if not is_within_work_hours(slot):
                    continue

                if slot in occupied_slots:
                    continue

                db.add(ScheduleEntry(
                    task_id=task.id,
                    start_time=slot,
                    end_time=slot + timedelta(hours=1),
                    status="pending"
                ))

                occupied_slots.add(slot)

                day_key = slot.date()
                daily_hours[day_key] = daily_hours.get(day_key, 0) + 1

            continue

        # ------------------------
        # NORMAL TASKS
        # ------------------------
        search_time = current_slot

        if task.start_time_limit and task.start_time_limit > search_time:
            search_time = task.start_time_limit.replace(
                minute=0, second=0, microsecond=0
            )

        while duration_left > 0:

            if search_time >= task.deadline:
                break

            if not is_within_work_hours(search_time):
                search_time += timedelta(hours=1)
                continue

            day_key = search_time.date()

            # Daily cap
            if daily_hours.get(day_key, 0) >= MAX_DAILY_HOURS:
                search_time = datetime.combine(
                    day_key + timedelta(days=1),
                    UNAVAILABLE_END
                )
                continue

            # Per-task daily cap
            if task_daily_hours.get(day_key, 0) >= MAX_TASK_HOURS_PER_DAY:
                search_time = datetime.combine(
                    day_key + timedelta(days=1),
                    UNAVAILABLE_END
                )
                continue

            # ------------------------
            # CHECK BLOCK AVAILABILITY
            # ------------------------
            can_schedule = True
            temp = search_time

            for _ in range(min(CHUNK_SIZE, duration_left)):
                if not is_within_work_hours(temp) or temp in occupied_slots:
                    can_schedule = False
                    break
                temp += timedelta(hours=1)

            if not can_schedule:
                search_time += timedelta(hours=1)
                continue

            # ------------------------
            # SCHEDULE BLOCK
            # ------------------------
            for _ in range(min(CHUNK_SIZE, duration_left)):
                db.add(ScheduleEntry(
                    task_id=task.id,
                    start_time=search_time,
                    end_time=search_time + timedelta(hours=1),
                    status="pending"
                ))

                occupied_slots.add(search_time)

                daily_hours[day_key] = daily_hours.get(day_key, 0) + 1
                task_daily_hours[day_key] = task_daily_hours.get(day_key, 0) + 1

                duration_left -= 1
                search_time += timedelta(hours=1)

            # Break after block
            search_time += timedelta(hours=BREAK_AFTER_BLOCK)

    db.commit()


# ------------------------
# FETCH WEEKLY VIEW
# ------------------------
def get_weekly_schedule(db: Session, start_date: datetime):

    end_date = start_date + timedelta(days=7)

    entries = db.query(ScheduleEntry).filter(
        ScheduleEntry.start_time >= start_date,
        ScheduleEntry.start_time < end_date
    ).all()

    return [
        {
            "id": e.id,
            "task_id": e.task_id,
            "task_name": e.task.name,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "date": e.start_time.isoformat().split("T")[0],
            "startTime": e.start_time.isoformat().split("T")[1][:5] if "T" in e.start_time.isoformat() else None,
            "duration": int((e.end_time - e.start_time).total_seconds() / 60) if e.end_time else 0,
            "priority": e.task.priority,
            "status": e.status,
            "energy": e.energy,
            "distraction": e.distraction,
            "mood": e.mood,
            "notes": e.notes
        }
        for e in entries
    ]