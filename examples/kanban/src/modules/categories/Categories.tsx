import { FunctionComponent } from 'react';

import { createCategory, deleteCategory, useCategories } from '../../state/categories';
import Category from '../category';

import NewCategory from './NewCategory';
import styles from './Categories.module.scss';

interface Props {}

const Categories: FunctionComponent<Props> = () => {
  const categories = useCategories();

  return (
    <div className={styles.categories}>
      {categories.map((category) => (
        <Category
          id={category.id}
          key={category.id}
          name={category.name}
          onDelete={() => deleteCategory(category.id)}
        />
      ))}

      <NewCategory onSubmit={createCategory} />
    </div>
  );
};

export default Categories;
