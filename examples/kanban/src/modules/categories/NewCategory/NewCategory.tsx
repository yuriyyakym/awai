import { FormEventHandler, FunctionComponent } from 'react';
import { v4 as uuid } from 'uuid';

import { Category } from '../../../types';

interface Props {
  onSubmit: (category: Category) => void;
}

const NewCategory: FunctionComponent<Props> = ({ onSubmit }) => {
  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    const name = prompt('Category name') || '';
    const newCategory = { id: uuid(), name };
    onSubmit(newCategory);
  };

  return <button onClick={handleSubmit}>Create category</button>;
};

export default NewCategory;
