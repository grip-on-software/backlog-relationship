import React, { useEffect, useRef } from 'react';
import { Card, Col, Form, Row, Collapse } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { configSelector, toggleUnestimatedIssues, setPastSprints, setUnestimatedSize } from '../slices/config';

const ConfigForm = () => {

  const dispatch = useDispatch();
  const { pastSprints, showUnestimatedIssues, unestimatedSize } = useSelector(configSelector);

  const pastSprintsNumber = useRef(null);
  const pastSprintsRange = useRef(null);

  const handlePastSprintChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (isNaN(value)) return;
    dispatch(setPastSprints(value));
  }

  const handleUnestimatedSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value)) return;
    if (value < 0) return;
    dispatch(setUnestimatedSize(value));
  }

  useEffect(() => {
    (pastSprintsNumber.current as unknown as HTMLInputElement).value = pastSprints.toString();
    (pastSprintsRange.current as unknown as HTMLInputElement).value = pastSprints.toString();
  }, [pastSprints]);

  return(
    <Form>
      <Form.Group controlId="pastSprints">
        <Form.Label>Number of past sprints to show</Form.Label>
        <Row>
          <Col className="d-flex align-items-center pr-0" xs="3" sm="2" lg="1">
            <Form.Control
              defaultValue={pastSprints}
              disabled              
              max={20} //todo
              min={1}
              onChange={handlePastSprintChange}
              ref={pastSprintsNumber}
              size="sm"
              step={1}
              type="number" />
          </Col>
          <Col className="d-flex align-items-center" xs="9" sm="10" lg="11">
            <Form.Control
              custom
              disabled
              defaultValue={pastSprints}
              max={20}
              min={1}
              onChange={handlePastSprintChange}
              ref={pastSprintsRange}
              step={1}
              type="range" />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group>
        <Form.Label>Unestimated issues</Form.Label>
        <Form.Check
          defaultChecked={showUnestimatedIssues}
          disabled
          id="showUnestimatedIssues"
          label="Show unestimated issues"
          onClick={() => dispatch(toggleUnestimatedIssues())}
          type="switch" />
      </Form.Group>
      <Collapse in={showUnestimatedIssues}>
        <Card>
          <Card.Body>
            <Form.Group controlId="unestimatedSize">
              <Form.Label>Number of story points</Form.Label>
              <Form.Control
                defaultValue={unestimatedSize}
                disabled
                min={0}
                onChange={handleUnestimatedSizeChange}
                type="number" />
            </Form.Group>
          </Card.Body>
        </Card>
      </Collapse>
    </Form>
  );
}

export default ConfigForm;
