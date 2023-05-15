import { action, scenario, state, useFlowValue } from 'flow-store';

import { Category, Id } from '../../types';
import { deleteTask, tasks } from '../tasks';

export const categories = state<Category[]>([]);

export const createCategory = action((category: Category) => {
  const newCategories = [...categories.get(), category];
  categories.set(newCategories);
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
