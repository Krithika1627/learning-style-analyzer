from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class Priority(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Difficulty(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Status(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    deadline = Column(DateTime)
    start_time_limit = Column(DateTime, nullable=True) # Earliest this can start
    fixed_time = Column(Integer, default=0) # 0 for false, 1 for true
    duration = Column(Integer, default=1)
    priority = Column(String, default="medium")
    difficulty = Column(String, default="medium")
    created_at = Column(DateTime, server_default="now()")

    schedule_entries = relationship("ScheduleEntry", back_populates="task", cascade="all, delete-orphan")

class ScheduleEntry(Base):
    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime)
    status = Column(String, default="pending")

    task = relationship("Task", back_populates="schedule_entries")
