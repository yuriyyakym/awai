import { useStateValue } from 'awai-react';
import { FunctionComponent } from 'react';

import {
  closeCreateCategoryModal,
  closeCreateTaskModal,
  createCategoryModalState,
  createTaskModalState,
} from '../../state/modals';

import CreateCategoryModal from './CreateCategoryModal';
import CreateTaskModal from './CreateTaskModal';

const Modals: FunctionComponent = () => {
  const isCreateCategoryModalOpen = useStateValue(createCategoryModalState) !== null;
  const isCreateTaskModalOpen = useStateValue(createTaskModalState) !== null;

  return (
    <>
      {isCreateCategoryModalOpen && (
        <CreateCategoryModal
          isOpen={isCreateCategoryModalOpen}
          onClose={closeCreateCategoryModal}
        />
      )}
      <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={closeCreateTaskModal} />
    </>
  );
};

export default Modals;
