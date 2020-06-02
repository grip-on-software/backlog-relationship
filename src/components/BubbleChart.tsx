import React, { useCallback, useEffect, useRef, useState } from "react";
import { Collapse, Figure } from "react-bootstrap";
import { useSelector } from "react-redux";

import { configSelector } from "../slices/config";

interface Props {
  className?: string,
  height: number,
  margin?: {
    bottom?: number,
    left?: number,
    right?: number,
    top?: number,
  }
}

const BubbleChart = (props: Props) => {

  const { board } = useSelector(configSelector);

  // Maintain references to container and main SVG element.
  const container = useRef<(HTMLElement & Figure<"figure">) | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  
  // Ensure responsive chart width.
  const [width, setWidth] = useState<number>(0);
  
  const handleResize = useCallback(() => {
    if (container.current!.offsetWidth !== width) {
      setWidth(container.current!.offsetWidth);
    }
  }, [width]);

  useEffect(() => {
    setWidth(container.current!.offsetWidth);
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <Collapse in={!!board}>
      <div className={props.className ? props.className : ""}>
        <Figure ref={container} className="figure-img d-block">
          <svg className="chart chart-bubbles" ref={svg} height={props.height} width={width} viewBox={`0 0 ${width} ${props.height}`}>
            <g className="root"></g>
          </svg>
        </Figure>
      </div>
    </Collapse>
  );
}

export default BubbleChart;