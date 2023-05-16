import { FunctionComponent } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';

import { Category } from '../../types';
import { useCategories } from '../../state';

interface Props {
  excludedCategoriesIds?: Category['id'][];
  onSelect: (category: Category) => void;
}

const CategorySelect: FunctionComponent<Props> = ({ excludedCategoriesIds = [], onSelect }) => {
  const categories = useCategories();
  const filteredCategories = categories.filter(
    (category) => !excludedCategoriesIds.includes(category.id),
  );

  const handleCategoryChange = (categoryId: Category['id'] | null) => {
    const category = filteredCategories.find((category) => category.id === categoryId);
    if (category) {
      onSelect(category);
    }
  };

  return (
    <DropdownButton align="end" title="Move" size="sm" onSelect={handleCategoryChange}>
      {filteredCategories.map((category) => (
        <Dropdown.Item as={Button} eventKey={category.id} key={category.id}>
          {category.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default CategorySelect;
