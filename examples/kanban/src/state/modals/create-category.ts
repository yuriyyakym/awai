import { action, state } from 'awai';

export const createCategoryModalState = state<true | null>(null);

export const openCreateCategoryModal = action(() => createCategoryModalState.set(true));
export const closeCreateCategoryModal = action(() => createCategoryModalState.set(null));
