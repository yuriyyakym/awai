import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { deleteCategory, openCreateTaskModal } from '../../state';
import type { Category as CategoryType } from '../../types';
import Tasks from '../tasks';

import styles from './Category.module.scss';

interface Props {
  id: CategoryType['id'];
  name: CategoryType['name'];
}

const Category: FunctionComponent<Props> = ({ name, id }) => (
  <div className={styles.category}>
    <div className={styles.heading}>
      <h2>{name}</h2>

      <div>
        <Button size="sm" variant="link" onClick={() => deleteCategory(id)}>
          🗑
        </Button>

        <Button size="sm" variant="link" onClick={() => openCreateTaskModal(id)}>
          ➕
        </Button>
      </div>
    </div>

    <Tasks className={styles.tasks} categoryId={id} />
  </div>
);

export default Category;
