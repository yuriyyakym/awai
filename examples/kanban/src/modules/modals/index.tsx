import { useFlowValue } from 'awai';
import { FunctionComponent } from 'react';

import {
  closeCreateCategoryModal,
  closeCreateTaskModal,
  createCategoryModalState,
  createTaskModalState,
} from '../../state/modals';

import CreateCategoryModal from './CreateCategoryModal';
import CreateTaskModal from './CreateTaskModal';

interface Props {}

const Modals: FunctionComponent<Props> = ({}) => {
  const isCreateCategoryModalOpen = useFlowValue(createCategoryModalState) !== null;
  const isCreateTaskModalOpen = useFlowValue(createTaskModalState) !== null;

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
