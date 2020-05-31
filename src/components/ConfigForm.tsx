import React from 'react';
import { Card, Col, Form, Row, Collapse } from 'react-bootstrap';

const ConfigForm = () => {

  return(
    <Form>
      <Form.Group controlId="pastSprints">
        <Form.Label>Number of past sprints to show</Form.Label>
        <Row>
          <Col className="d-flex align-items-center pr-0" xs="3" sm="2" lg="1">
            <Form.Control size="sm" type="number" />
          </Col>
          <Col className="d-flex align-items-center" xs="9" sm="10" lg="11">
            <Form.Control type="range" custom />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group>
        <Form.Label>Unestimated issues</Form.Label>
        <Form.Check id="showUnestimatedIssues" label="Show unestimated issues" type="switch" defaultChecked />
      </Form.Group>
      <Collapse in={true}>
        <Card>
          <Card.Body>
            <Form.Group controlId="unestimatedSize">
              <Form.Label>Number of story points</Form.Label>
              <Form.Control type="number" />
            </Form.Group>
          </Card.Body>
        </Card>
      </Collapse>
    </Form>
  );
}

export default ConfigForm;
