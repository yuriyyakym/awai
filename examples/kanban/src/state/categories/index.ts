import { action, scenario, state } from 'awai';
import { useStateValue } from 'awai-react';
import { v4 as uuid } from 'uuid';

import { Category } from '../../types';
import { createTask, deleteTask, tasks } from '../tasks';

export const categories = state<Category[]>([]);

export const createCategory = action((partialCategory: Omit<Category, 'id'>): Category => {
  const id = uuid();
  const category = { ...partialCategory, id };
  categories.set((categories) => [...categories, category]);
  return category;
});

export const deleteCategory = action((id: Category['id']) => {
  categories.set((categories) => {
    return categories.filter((category) => category.id !== id);
  });
});

scenario(deleteCategory.events.invoked, ({ arguments: [removedCategoryId] }) => {
  tasks
    .get()
    .filter((task) => task.categoryId === removedCategoryId)
    .forEach((task) => deleteTask(task.id));
});

scenario(createCategory.events.resolved, ({ result: category }) => {
  if (categories.get().length === 1) {
    createTask({
      categoryId: category.id,
      description: 'This is a very first task. Feel free to delete it.',
      title: 'Welcome!',
    });
  }
});

export const useCategories = () => useStateValue(categories);
