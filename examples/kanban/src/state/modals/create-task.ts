import { action, state } from 'awai';

import { Category } from '../../types';

export const createTaskModalState = state<{ categoryId: Category['id'] } | null>(null);

export const openCreateTaskModal = action((categoryId: Category['id']) =>
  createTaskModalState.set({ categoryId }),
);
export const closeCreateTaskModal = action(() => createTaskModalState.set(null));
