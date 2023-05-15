import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { openCreateCategoryModal, useCategories } from '../../state';
import Category from '../category';

import styles from './Categories.module.scss';

const Categories: FunctionComponent = () => {
  const categories = useCategories();

  return (
    <div className={styles.categories}>
      {categories.map((category) => (
        <Category id={category.id} key={category.id} name={category.name} />
      ))}

      <div>
        <Button onClick={openCreateCategoryModal}>Create category</Button>
      </div>
    </div>
  );
};

export default Categories;
