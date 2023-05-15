import { FormEventHandler, FunctionComponent, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { createCategory } from '../../../state';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCategoryModal: FunctionComponent<Props> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    createCategory({ name });
    setName('');
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Category"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
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

export default CreateCategoryModal;
