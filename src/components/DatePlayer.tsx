import React, { useEffect } from 'react';
import { Col, ButtonToolbar, ButtonGroup, Row } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import { useDispatch, useSelector } from 'react-redux';
import { faBackward, faForward, faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';

import { configSelector, setDate } from '../slices/config';
import { decreaseSpeed, increaseSpeed, pause, play, playerSelector, playSpeeds, stop } from '../slices/player';

import DatePlayerButton from './DatePlayerButton';

interface Props {
  className?: string,
};

let timeout: NodeJS.Timeout;

const today = (ms: number) => {
  const date = new Date(ms);
  return new Date(date.toDateString());
}

const tomorrow = (ms: number) => {
  return today(ms + 24 * 60 * 60 * 1000);
}

const DatePlayer = (props: Props) => {
  const dispatch = useDispatch();
  const { date, boardId } = useSelector(configSelector);
  const { isPlaying, range, speed } = useSelector(playerSelector);

  // Callbacks.

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDate(parseInt(event.target.value)));
  }

  const handleFasterClick = () => {
    if (!boardId) return;
    dispatch(increaseSpeed());
  }

  const handlePlayClick = () => {
    if (!boardId) return;
    if (isPlaying) {
      dispatch(pause())
    } else {
      dispatch(play());
    }
  }
  
  const handleSlowerClick = () => {
    if (!boardId) return;
    dispatch(decreaseSpeed())
  }

  const handleStopClick = () => {
    if (!boardId) return;
    dispatch(stop());
    dispatch(setDate(range[0]));
  }

  // Effects.

  useEffect(() => {
    dispatch(setDate(range[0]));
  }, [dispatch, range]);

  useEffect(() => {
    clearTimeout(timeout);
    if (isPlaying) {
      timeout = setTimeout(() => {
        dispatch(setDate(date + playSpeeds[speed].interval));
      }, 1000);
    }
  }, [date, dispatch, isPlaying, speed]);

  return (
    <fieldset disabled={!boardId}>
      <Row className="align-items-center">
        <Col xs="auto" className="pr-0">
          <ButtonToolbar className={props.className || ""} aria-label="Toolbar with play/pause buttons and range slider">
            <ButtonGroup size="sm" aria-label="Play control buttons">
              <DatePlayerButton 
                disabled={0 === speed}
                id="slower"
                icon={faBackward}
                label="Slower"
                onClick={handleSlowerClick} />
              <DatePlayerButton 
                id="play-pause"
                icon={isPlaying ? faPause : faPlay}
                label={isPlaying ? "Pause" : "Play"}
                onClick={handlePlayClick} />
              <DatePlayerButton 
                id="stop"
                icon={faStop}
                label="Stop"
                onClick={handleStopClick} />
              <DatePlayerButton 
                disabled={playSpeeds.length-1 === speed}
                id="faster"
                icon={faForward}
                label="Faster"
                onClick={handleFasterClick} />
            </ButtonGroup>
          </ButtonToolbar>
        </Col>
        <Col>
            <RangeSlider
              disabled={!boardId}
              max={tomorrow(range[1]).getTime()}
              min={today(range[0]).getTime()}
              onChange={handleRangeChange}
              step={playSpeeds[speed].interval}
              tooltip={date > 0 ? "on" : "off"}
              tooltipLabel={
                (value: number) => 
                  <span className="text-nowrap">{
                    new Date(value).toLocaleDateString('nl-NL')
                  }, {
                    playSpeeds[speed].label
                  }/s</span>
              }
              value={date} />
        </Col>
      </Row>
    </fieldset>
  );
};

export default DatePlayer;