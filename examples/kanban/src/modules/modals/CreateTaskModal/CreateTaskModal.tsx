import { useFlowValue } from 'flow-store';
import { FormEventHandler, FunctionComponent, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { createTaskModalState } from '../../../state/modals';
import { createTask } from '../../../state/tasks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: FunctionComponent<Props> = ({ isOpen, onClose }) => {
  const data = useFlowValue(createTaskModalState);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    const newTask = { categoryId: data!.categoryId, description, title };
    createTask(newTask);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Title"
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Details</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTaskModal;
