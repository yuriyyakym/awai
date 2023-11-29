import { action, state } from 'awai';
import { useStateValue } from 'awai-react';
import { v4 as uuid } from 'uuid';

import { Category, Task } from '../../types';

export const tasks = state<Task[]>([]);

export const updateTask = (taskId: Task['id'], patch: Partial<Omit<Task, 'id'>>) => {
  tasks.set((currentTasks) =>
    currentTasks.map((task) => {
      return task.id === taskId ? { ...task, ...patch } : task;
    }),
  );
};

export const createTask = action(async (task: Omit<Task, 'id'>) => {
  const id = uuid();
  tasks.set((current) => [...current, { ...task, id }]);
});

export const deleteTask = action((id: Task['id']) => {
  tasks.set((current) => current.filter((task) => task.id !== id));
});

export const moveTask = action((taskId: Task['id'], categoryId: Category['id']) => {
  updateTask(taskId, { categoryId });
});

export const useTask = (id: Task['id']) => {
  const allTasks = useStateValue(tasks);
  const task = allTasks.find((task) => task.id === id);

  if (!task) {
    throw new Error('Task does not exist');
  }

  return task;
};

export const useTasks = () => useStateValue(tasks);
