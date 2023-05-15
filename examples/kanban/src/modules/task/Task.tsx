import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';

import type { Task as TaskType } from '../../types';
import { deleteTask, useTask } from '../../state/tasks';
import CategorySelect from '../category-select';

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
          <CategorySelect excludedCategoriesIds={[task.categoryId]} onChange={console.log} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Task;
