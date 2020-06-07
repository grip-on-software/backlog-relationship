import { faJira } from "@fortawesome/free-brands-svg-icons"
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Figure, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";

import { authSelector, getCurrentUser, getMyself, login } from "../slices/auth";

const JiraLogin = () => {

  const dispatch = useDispatch();
  const { avatarURL, displayName, email, isLoggedIn, loginFailed, loginPending, username } = useSelector(authSelector);

  const [usernameInput, passwordInput] = [useRef(null), useRef(null)];
  const [show, setShow] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) return;
    dispatch(getMyself());
  }, [dispatch, isLoggedIn]);

  const handleJiraButtonClick = () => {
    setShow(true);
  }

  const handleModalClose = () => {
    setShow(false);
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggedIn) return;
    dispatch(login({
      username: (usernameInput.current! as HTMLInputElement).value,
      password: (passwordInput.current! as HTMLInputElement).value,
    }));
  }

  return(
    <>
      <Modal
        onHide={handleModalClose}
        show={show}>
        <Modal.Header>
          <div>
            <FontAwesomeIcon className="mr-2" icon={faJira}/>
            Authenticate with Jira
          </div>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {
              isLoggedIn
              ? <Card
                  bg="light">
                  <Card.Header>Logged in as</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col xs="auto" className="pr-1">
                        <Figure>
                          <Figure.Image
                            height={48}
                            src={avatarURL || "http://jira.example/jira/secure/useravatar?avatarId=10122"}
                            width={48} />
                        </Figure>
                      </Col>
                      <Col>
                        <Card.Title>
                          { displayName || <Spinner animation="border" role="status" size="sm" /> }
                        </Card.Title>
                        <Card.Subtitle>
                          { email || <Spinner animation="border" role="status" size="sm" /> }
                        </Card.Subtitle>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              : <>
                <Alert variant="info">
                  Please note:
                  <ul className="pl-4">
                    <li>Your credentials are required to obtain a session token from the JIRA API at <a href="http://jira.example/jira" target="_blank" rel="noopener noreferrer"><code>http://jira.example/jira</code><FontAwesomeIcon icon={faExternalLinkAlt} size="xs" className="ml-1" /></a>.</li>
                    <li>Credentials are not stored.</li>
                  </ul>
                </Alert>
                  <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      autoCapitalize="off"
                      disabled={loginPending}
                      ref={usernameInput}
                      type="text" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      disabled={loginPending}
                      isInvalid={loginFailed}
                      ref={passwordInput}
                      type="password" />
                    <Form.Control.Feedback type="invalid">
                      The password you entered is incorrect.
                    </Form.Control.Feedback>
                  </Form.Group>
                </>
            }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={handleModalClose}>Close</Button>
            {
              isLoggedIn
              ? <></>
              : <Button 
                  disabled={loginPending}
                  type="submit"
                  variant="primary">
                  {
                    loginPending
                    ? "Logging In..."
                    : "Log In"
                  }
                  <Spinner
                    animation="border"
                    as="span"
                    className={`ml-2 ${loginPending ? "" : "d-none"}`}
                    role="status"
                    size="sm" />
                </Button>
            }
          </Modal.Footer>
        </Form>
      </Modal>
      <Button
        className="button-jira-login"
        onClick={handleJiraButtonClick}
        size="lg"
        variant="primary">
        <FontAwesomeIcon icon={faJira} />
      </Button>
    </>
  );
}

export default JiraLogin;
