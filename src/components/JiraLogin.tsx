import { faJira } from "@fortawesome/free-brands-svg-icons"
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Figure, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";

import { authSelector, autoLogin, login, LoginStatus } from "../slices/auth";
import { getCurrentUser, userSelector } from "../slices/user";

const JiraLogin = () => {

  const dispatch = useDispatch();
  const { autoLoginFailed, loginFailed, loginStatus } = useSelector(authSelector);
  const { avatarURL, displayName, emailAddress, username } = useSelector(userSelector);

  const [usernameInput, passwordInput] = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [show, setShow] = useState(false);

  const spinner = <Spinner animation="border" role="status" size="sm" />;

  useEffect(() => {
    dispatch(autoLogin());
  }, [dispatch]);

  useEffect(() => {
    if (!autoLoginFailed) return;
    setShow(true);
  }, [autoLoginFailed]);

  useEffect(() => {
    if (LoginStatus.LoggedIn !== loginStatus) return;
    dispatch(getCurrentUser());
  }, [dispatch, loginStatus]);

  const handleJiraButtonClick = () => {
    setShow(true);
  }

  const handleModalClose = () => {
    setShow(false);
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (LoginStatus.LoggedOut !== loginStatus) return;
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
              LoginStatus.LoggedIn === loginStatus
              ? <Card
                  bg="light">
                  <Card.Header>Authenticated as <code>{username || spinner}</code></Card.Header>
                  <Card.Body>
                    <Row>
                      <Col xs="auto" className="pr-1">
                        <Figure>
                          <Figure.Image
                            height={48}
                            src={avatarURL || `${process.env.REACT_APP_JIRA_URL}/secure/useravatar?avatarId=10122`}
                            width={48} />
                        </Figure>
                      </Col>
                      <Col>
                        <Card.Title>
                          {displayName || spinner}
                        </Card.Title>
                        <Card.Subtitle className="text-muted">
                          {emailAddress || spinner}
                        </Card.Subtitle>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              : <>
                  <Alert variant="info">
                    Please note:
                    <ul className="pl-4">
                      <li>Your credentials are required to obtain a session token from the JIRA API at <a href={process.env.REACT_APP_JIRA_URL} target="_blank" rel="noopener noreferrer"><code>{process.env.REACT_APP_JIRA_URL}</code><FontAwesomeIcon icon={faExternalLinkAlt} size="xs" className="ml-1" /></a>.</li>
                      <li>Credentials are not stored.</li>
                    </ul>
                  </Alert>
                  <Form.Group controlId="jiraUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      autoCapitalize="off"
                      disabled={LoginStatus.Pending === loginStatus}
                      ref={usernameInput}
                      required
                      type="text" />
                  </Form.Group>
                  <Form.Group controlId="jiraPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      disabled={LoginStatus.Pending === loginStatus}
                      isInvalid={loginFailed}
                      ref={passwordInput}
                      required
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
              LoginStatus.LoggedIn === loginStatus
              ? <></>
              : <Button 
                  disabled={LoginStatus.Pending === loginStatus}
                  type="submit"
                  variant="primary">
                  {
                    LoginStatus.Pending === loginStatus
                    ? "Authenticating..."
                    : "Authenticate"
                  }
                  <Spinner
                    animation="border"
                    as="span"
                    className="ml-2"
                    hidden={LoginStatus.Pending !== loginStatus}
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
