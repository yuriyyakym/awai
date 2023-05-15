import { FunctionComponent } from 'react';

import { Category } from '../../types';
import { useTasks } from '../../state';
import Task from '../task';

interface Props {
  className?: string;
  categoryId: Category['id'];
}

const Tasks: FunctionComponent<Props> = ({ className, categoryId }) => {
  const tasks = useTasks();
  const categoryTasks = tasks.filter((task) => task.categoryId === categoryId);

  return (
    <div className={className}>
      {categoryTasks.map((task) => (
        <Task id={task.id} key={task.id} />
      ))}
    </div>
  );
};

export default Tasks;
