import { FunctionComponent } from 'react';

import type { Task as TaskType } from '../../types';
import { deleteTask, useTask } from '../../state/tasks';

interface Props {
  id: TaskType['id'];
}

const Task: FunctionComponent<Props> = ({ id }) => {
  const task = useTask(id);

  return (
    <div>
      <p>{task.title}</p>
      {task.description && <div>{task.description}</div>}

      <button onClick={() => deleteTask(id)}>&times;</button>
    </div>
  );
};

export default Task;
