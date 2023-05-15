import { FunctionComponent } from 'react';

import { Category } from '../../types';
import { createTask, useTasks } from '../../state/tasks';
import Task from '../task';
import NewTask from './NewTask';

interface Props {
  categoryId: Category['id'];
}

const Tasks: FunctionComponent<Props> = ({ categoryId }) => {
  const tasks = useTasks();
  const categoryTasks = tasks.filter((task) => task.categoryId === categoryId);

  return (
    <div>
      <NewTask
        onSubmit={({ description, title }) => createTask({ categoryId, description, title })}
      />

      {categoryTasks.map((task) => (
        <Task id={task.id} key={task.id} />
      ))}
    </div>
  );
};

export default Tasks;
