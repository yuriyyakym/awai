import { action, fork, scenario, state } from 'awai';
import { useStateValue } from 'awai-react';
import { v4 as uuid } from 'uuid';

import { Category, Id } from '../../types';
import { createTask, deleteTask, tasks } from '../tasks';

export const categories = state<Category[]>([]);

export const createCategory = action((partialCategory: Omit<Category, 'id'>) => {
  const id = uuid();
  const category = { ...partialCategory, id };
  categories.set((categories) => [...categories, category]);
  return category;
});

action();

export const deleteCategory = action((id: Category['id']) => {
  categories.set((categories) => {
    return categories.filter((category) => category.id !== id);
  });
});

scenario(async () => {
  const [removedCategoryId] = await deleteCategory.events.invoked;

  fork(async () => {
    tasks
      .get()
      .filter((task) => task.categoryId === removedCategoryId)
      .forEach((task) => deleteTask(task.id));
  });
});

scenario(async () => {
  await createCategory.events.completed;

  fork(async () => {
    const [category] = await categories;

    if (categories.get().length === 1) {
      await createTask({
        categoryId: category.id,
        description: 'This is a very first task. Feel free to delete it.',
        title: 'Welcome!',
      });
    }
  });
});

export const useCategories = () => useStateValue(categories);
