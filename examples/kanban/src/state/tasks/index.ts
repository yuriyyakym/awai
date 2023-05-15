import { action, state, useFlowValue } from 'flow-store';
import { useMemo } from 'react';
import { v4 as uuid } from 'uuid';

import { Task } from '../../types';

export const tasks = state<Task[]>([]);

export const createTask = action((task: Omit<Task, 'id'>) => {
  const id = uuid();
  tasks.set([...tasks.get(), { ...task, id }]);
});

export const deleteTask = action((id: Task['id']) => {
  tasks.set(tasks.get().filter((task) => task.id !== id));
});

export const useTask = (id: Task['id']) => {
  const allTasks = useFlowValue(tasks);
  const task = useMemo(() => allTasks.find((task) => task.id === id), [allTasks, id]);

  if (!task) {
    throw new Error('Task does not exist');
  }

  return task;
};

export const useTasks = () => useFlowValue(tasks);
