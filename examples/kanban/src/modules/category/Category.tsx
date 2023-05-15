import { FunctionComponent } from 'react';

import type { Category as CategoryType } from '../../types';
import Tasks from '../tasks';

import styles from './Category.module.scss';

interface Props {
  id: CategoryType['id'];
  name: CategoryType['name'];
  onDelete: () => void;
}

const Category: FunctionComponent<Props> = ({ name, id, onDelete }) => (
  <div className={styles.category}>
    <h2>{name}</h2>

    <button onClick={onDelete}>Delete</button>

    <div>
      <Tasks categoryId={id} />
    </div>
  </div>
);

export default Category;
