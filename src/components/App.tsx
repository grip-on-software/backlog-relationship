import React from 'react';
import { Alert, Card, Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { alertsSelector, deleteAlert } from '../slices/alerts';
import BoardTypeahead from './BoardTypeahead';
import BubbleChart from './BubbleChart';
import ConfigForm from './ConfigForm';
import DatePlayer from './DatePlayer';
import JiraLogin from './JiraLogin';

const App = () => {
  
  const dispatch = useDispatch();
  const { alerts } = useSelector(alertsSelector);

  return(
    <>
      <JiraLogin />
      <Container>
        <Row>
          <Col>
            <h2 className="my-4">Backlog Progression Chart</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            {
              alerts.map((alert, idx) => 
                <Alert
                  dismissible={alert.dismissible}
                  key={idx}
                  onClose={() => dispatch(deleteAlert(idx))}
                  variant={alert.variant}>
                    {alert.message}
                </Alert>
              )
            }
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="mb-4">
              <Card.Body>
                <Container className="p-0" fluid>
                  <Row>
                    <Col>
                      <BoardTypeahead />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <BubbleChart height={512} />
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
              <Card.Footer>
                <DatePlayer />
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="mb-4">
              <Tab.Container defaultActiveKey="configure">
                <Card.Header>
                  <Nav variant="tabs" className="nav-overflow">
                    <Nav.Item>
                      <Nav.Link eventKey="configure">Configure</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>
                <Card.Body>
                  <Tab.Content>
                    <Tab.Pane eventKey="configure">
                      <ConfigForm />
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Tab.Container>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
