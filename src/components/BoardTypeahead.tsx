import React, { Fragment, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Highlighter, Typeahead, TypeaheadMenuProps, TypeaheadResult } from 'react-bootstrap-typeahead';
import { useDispatch, useSelector } from 'react-redux';

import { LoginStatus, authSelector } from '../slices/auth';
import { Board, fetchBoards, selectAllBoards } from '../slices/boards';
import { setBoard } from '../slices/config';

interface Props {
  className?: string,
};

const BoardTypeahead = (props: Props) => {

  const dispatch = useDispatch();

  const { loginStatus } = useSelector(authSelector);
  const allBoards = useSelector(selectAllBoards);

  useEffect(() => {
    if (LoginStatus.LoggedIn !== loginStatus) return;
    dispatch(fetchBoards());
  }, [dispatch, loginStatus]);

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
            options={allBoards}
            onChange={handleChange}
            placeholder="Find a board..."
            renderMenuItemChildren={renderMenuItem} />
        </Form.Group>
      </Form>
    </div>
  );
};

export default BoardTypeahead;