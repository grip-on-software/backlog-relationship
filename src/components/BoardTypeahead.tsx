import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setBoard } from '../slices/config'; 
import { Board, dataSelector, fetchBoards } from '../slices/data'; 

import { Form } from 'react-bootstrap';
import { Highlighter, Typeahead, TypeaheadMenuProps, TypeaheadResult } from 'react-bootstrap-typeahead';

interface Props {
  className?: string,
};

const BoardTypeahead = (props: Props) => {
  const dispatch = useDispatch();
  const { boards } = useSelector(dataSelector);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleChange = (selected: Board[]) => selected.length ? dispatch(setBoard(selected[0])) : null;

  const renderMenuItem = (board: TypeaheadResult<Board>, props: TypeaheadMenuProps<Board>, idx: number) => {
    return(
      <Fragment>
        <Highlighter key={board.label} search={props.text}>{board.label}</Highlighter>
      </Fragment>
    )
  };

  return (
    <div className={props.className || ""}>
      <Form>
        <Form.Group>
          <Typeahead
            bsSize="lg"
            id="board"
            options={boards}
            onChange={handleChange}
            placeholder="Find a board..."
            renderMenuItemChildren={renderMenuItem} />
        </Form.Group>
      </Form>
    </div>
  );
};

export default BoardTypeahead;