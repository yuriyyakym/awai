import { action, scenario, state, useFlowValue } from 'flow-store';
import { v4 as uuid } from 'uuid';

import { Category, Id } from '../../types';
import { deleteTask, tasks } from '../tasks';

export const categories = state<Category[]>([]);

export const createCategory = action((category: Omit<Category, 'id'>) => {
  const id = uuid();
  categories.set([...categories.get(), { ...category, id }]);
});

export const deleteCategory = action<[Id]>((id: Category['id']) => {
  const newCategories = categories.get().filter((category) => category.id !== id);
  categories.set(newCategories);
});

scenario(async () => {
  // prettier-ignore
  const [removedCategoryId] = await deleteCategory.events.invoke;

  tasks
    .get()
    .filter((task) => task.categoryId === removedCategoryId)
    .forEach((task) => deleteTask(task.id));
});

export const useCategories = () => useFlowValue(categories);
