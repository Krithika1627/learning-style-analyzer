'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfDay, addHours, addWeeks, subWeeks } from 'date-fns';

export default function CalendarPage() {
  const [taskInput, setTaskInput] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Colors for priority
  const priorityColors = {
    high: 'bg-red-100 border-red-300 text-red-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-green-100 border-green-300 text-green-800',
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`http://localhost:8000/schedule?start_date=${currentWeekStart.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentWeekStart]);

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) fetchSchedule();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleCompleteTask = async (entryId) => {
    try {
      const response = await fetch(`http://localhost:8000/schedule/${entryId}/complete`, { method: 'PATCH' });
      if (response.ok) fetchSchedule();
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: taskInput }),
      });

      if (!response.ok) throw new Error("Failed to add task");
      
      setTaskInput("");
      fetchSchedule(); // Refresh
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTaskForSlot = (day, hour) => {
    const slotTime = addHours(startOfDay(day), hour);
    // Find entry where start_time (ISO string) matches
    return schedule.find(entry => {
        const entryStart = new Date(entry.start_time);
        return entryStart.getTime() === slotTime.getTime();
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
        
        <div className="flex items-center bg-white rounded-lg shadow-sm border p-1 shrink-0">
          <button 
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
            title="Previous Week"
          >
            ←
          </button>
          <button 
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Current Week
          </button>
          <button 
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
            title="Next Week"
          >
            →
          </button>
        </div>
      </div>

      {/* NLP Input */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g., Finish project by Friday 5pm high priority"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : null}
            Add Task
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <p className="text-xs text-gray-500 mt-3 italic">
          Try: "Study Math for 2 hours before Sunday" or "Gym tomorrow 8am low priority"
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b">
            {/* Time column header */}
            <div className="p-4 border-r bg-gray-50 font-semibold text-gray-500 text-sm">Time</div>
            {/* Day headers */}
            {weekDays.map((day, i) => (
              <div key={i} className="p-4 text-center border-r last:border-r-0 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">{format(day, 'EEE')}</p>
                <p className="text-xs text-gray-500">{format(day, 'MMM d')}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8">
            {hours.map((hour) => (
              <>
                {/* Time Label */}
                <div key={`time-${hour}`} className="p-2 border-r border-b text-xs text-secondary-500 text-right h-12 flex items-start justify-end sticky left-0 bg-white">
                  {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
                
                {weekDays.map((day, i) => {
                  const task = getTaskForSlot(day, hour);
                  return (
                    <div 
                      key={`${i}-${hour}`} 
                      className="border-r border-b h-12 bg-white relative group"
                    >
                      {task && (
                        <div className={`absolute inset-1 p-1 rounded border text-[10px] leading-tight flex flex-col justify-center overflow-hidden z-10 transition-all ${priorityColors[task.priority] || 'bg-blue-50 border-blue-200'} ${task.status === 'completed' ? 'opacity-50 line-through' : ''}`}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold truncate pr-3">{task.task_name}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.task_id); }}
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 transition-opacity bg-white/50 rounded p-0.5"
                              title="Delete Task"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-auto">
                            <span className="opacity-70 uppercase text-[8px]">{task.priority}</span>
                            {task.status !== 'completed' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleCompleteTask(task.id); }}
                                className="bg-white/80 hover:bg-white text-gray-700 px-1 py-0.5 rounded border border-gray-200 text-[8px] font-bold shadow-sm"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
