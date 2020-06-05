import { faJira } from "@fortawesome/free-brands-svg-icons"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';

const JiraLogin = () => {

  const [show, setShow] = useState(false);

  const handleButtonClick = () => {
    setShow(true);
  }

  const handleModalClose = () => {
    setShow(false);
  }

  return(
    <>
      <Modal
        onHide={handleModalClose}
        show={show}>
        <Modal.Header>Authenticate with JIRA</Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FontAwesomeIcon className="mr-2" icon={faInfoCircle} />
            <span>To access your boards in JIRA, you will need to authenticate.</span>
          </Alert>
          <Form>
            <Form.Group controlId="jiraUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text"></Form.Control>
            </Form.Group>
            <Form.Group controlId="jiraPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password"></Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleModalClose}>Close</Button>
          <Button variant="primary">Log In</Button>
        </Modal.Footer>
      </Modal>
      <Button
        className="button-jira-login"
        onClick={handleButtonClick}
        size="lg"
        variant="primary">
        <FontAwesomeIcon icon={faJira} />
      </Button>
    </>
  );
}

export default JiraLogin;
