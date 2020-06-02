import React, { useEffect, useRef } from 'react';
import { Card, Col, Form, Row, Collapse } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { configSelector, toggleUnestimatedIssues, setPastSprints, setUnestimatedSize } from '../slices/config';
import { dataSelector } from '../slices/data';

const ConfigForm = () => {

  const dispatch = useDispatch();
  const { board, pastSprints, showUnestimatedIssues, unestimatedSize } = useSelector(configSelector);
  const { sprints } = useSelector(dataSelector);

  const pastSprintsNumber = useRef(null);
  const pastSprintsRange = useRef(null);

  const handlePastSprintChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    (pastSprintsNumber.current as unknown as HTMLInputElement).value = event.target.value;
    (pastSprintsRange.current as unknown as HTMLInputElement).value = event.target.value;
  }

  const handlePastSprintMouseUp = (event: React.MouseEvent<HTMLInputElement>) => {
    const value = parseInt((event.target as HTMLInputElement).value);
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

  useEffect(() => {
    if (!sprints.length) return;
    (pastSprintsNumber.current as unknown as HTMLInputElement).max = sprints.length.toString();
    (pastSprintsRange.current as unknown as HTMLInputElement).max = sprints.length.toString();
  }, [sprints])

  return(
    <Form>
      <Form.Group controlId="pastSprints">
        <Form.Label>Number of past sprints to show</Form.Label>
        <Row>
          <Col className="d-flex align-items-center pr-0" xs="3" sm="2" lg="1">
            <Form.Control
              defaultValue={pastSprints}
              disabled={!sprints.length}
              min={sprints.length ? 1 : 0}
              onChange={handlePastSprintChange}
              onMouseUp={handlePastSprintMouseUp}
              ref={pastSprintsNumber}
              size="sm"
              step={1}
              type="number" />
          </Col>
          <Col className="d-flex align-items-center" xs="9" sm="10" lg="11">
            <Form.Control
              custom
              defaultValue={pastSprints}
              disabled={!sprints.length}
              min={sprints.length ? 1 : 0}
              onChange={handlePastSprintChange}
              onMouseUp={handlePastSprintMouseUp}
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
          disabled={!board}
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
                disabled={!board}
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
