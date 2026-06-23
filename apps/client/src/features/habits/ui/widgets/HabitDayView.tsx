'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface HabitProgress {
  target: number;
  current: number;
  completed: boolean;
  unit: string;
}

interface HabitForDay {
  id: string;
  name: string;
  status: string;
  timeOfDay: string;
  progress: HabitProgress;
}

interface HabitDayViewProps {
  date: string;
  onHabitComplete?: (habitId: string) => void;
}

export function HabitDayView({ date, onHabitComplete }: HabitDayViewProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const { data, refetch } = useQuery<{ today: HabitForDay[]; week: HabitForDay[] }>({
    queryKey: ['habits', 'forDate', date],
    queryFn: () =>
      fetch(`/api/habits/for-date?date=${date}`).then((r) => r.json()),
  });

  const { mutate: logHabit } = useMutation({
    mutationFn: (habitId: string) =>
      fetch('/api/habit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          value: 1,
          logDate: new Date().toISOString(),
        }),
      }),
  });

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        refetch();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  function handleComplete(habitId: string) {
    logHabit(habitId, {
      onSuccess: () => {
        completedIds.push(habitId);
        setCompletedIds(completedIds);
        onHabitComplete?.(habitId);
      },
    });
  }

  const habits = [...(data?.today ?? []), ...(data?.week ?? [])];

  if (!data) {
    return <p>Loading habits...</p>;
  }

  return (
    <div>
      <h2>Habits for {date}</h2>
      <ul>
        {habits.map((habit, index) => (
          <li key={index}>
            <span>{habit.name}</span>
            <span>
              {habit.progress.current} / {habit.progress.target} {habit.progress.unit}
            </span>
            {!completedIds.includes(habit.id) && !habit.progress.completed && (
              <button onClick={() => handleComplete(habit.id)}>Mark done</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
