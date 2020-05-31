import React from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { alertsSelector, deleteAlert } from '../slices/alerts';
import ProjectTypeahead from './ProjectTypeahead';

const App = () => {
  
  const dispatch = useDispatch();
  const { alerts } = useSelector(alertsSelector);

  return(
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
              <ProjectTypeahead />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
