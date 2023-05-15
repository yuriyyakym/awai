import { FunctionComponent } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';

import { Category } from '../../types';
import { useCategories } from '../../state';

interface Props {
  excludedCategoriesIds?: Category['id'][];
  onChange: (category: Category) => void;
}

const CategorySelect: FunctionComponent<Props> = ({ excludedCategoriesIds = [] }) => {
  const categories = useCategories();
  const filteredCategories = categories.filter(
    (category) => !excludedCategoriesIds.includes(category.id),
  );

  return (
    <DropdownButton align="end" title="Move" size="sm">
      {filteredCategories.map((category) => (
        <Dropdown.Item as={Button} key={category.id}>
          {category.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default CategorySelect;
