import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

interface Props {
  className?: string,
  disabled?: boolean,
  icon: IconDefinition,
  id: number | string,
  label: string,
  onClick: () => void,
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger'
    | 'outline-warning'
    | 'outline-info'
    | 'outline-dark'
    | 'outline-light'
}

const DatePlayerButton = (props: Props) => {

  const tooltip = <Tooltip id={`tooltip-${props.id}`}>{props.label}</Tooltip>

  return(
    <OverlayTrigger placement="top" overlay={tooltip}>
      <Button variant={props.variant || "secondary"} onClick={props.onClick} aria-label={props.label} disabled={props.disabled}>
        <FontAwesomeIcon icon={props.icon} />
      </Button>
    </OverlayTrigger>
  );
}

export default DatePlayerButton;