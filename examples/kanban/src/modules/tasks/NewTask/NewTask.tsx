import { FormEventHandler, FunctionComponent, useState } from 'react';

import { Task } from '../../../types';

interface Props {
  onSubmit: (taskPayload: Pick<Task, 'title' | 'description'>) => void;
}

const NewTask: FunctionComponent<Props> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    const newTask = { description, title };
    onSubmit(newTask);
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} />
      <input value={description} onChange={(event) => setDescription(event.target.value)} />
      <button onClick={handleSubmit}>Create task</button>
    </form>
  );
};

export default NewTask;
