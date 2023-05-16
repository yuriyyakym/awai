import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';

import CategorySelect from '../category-select';
import type { Task as TaskType } from '../../types';
import { deleteTask, moveTask, useTask } from '../../state';

import styles from './Task.module.scss';

interface Props {
  id: TaskType['id'];
}

const Task: FunctionComponent<Props> = ({ id }) => {
  const task = useTask(id);

  return (
    <Card className={styles.task}>
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        <Card.Text>{task.description}</Card.Text>
        <div className={styles.actions}>
          <Button size="sm" onClick={() => deleteTask(id)}>
            Delete
          </Button>
          <CategorySelect
            excludedCategoriesIds={[task.categoryId]}
            onSelect={(category) => moveTask(id, category.id)}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Task;
