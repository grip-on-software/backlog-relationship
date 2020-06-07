import { Selection, forceCenter, forceManyBody, forceSimulation, select, SimulationNodeDatum } from "d3";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Figure } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { configSelector } from "../slices/config";
import { dataSelector, fetchIssues, fetchSprints } from "../slices/data";

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

  const dispatch = useDispatch();
  const { board, pastSprints } = useSelector(configSelector);
  const { sprints } = useSelector(dataSelector);

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

  // Fetch issues & sprints after board has changed.
  useEffect(() => {
    if (!board) return;
    dispatch(fetchIssues(board.id));
    dispatch(fetchSprints(board.id));
  }, [board, dispatch]);

  const sprintNodes = useMemo(() => {
    return sprints.slice(-pastSprints)
      .map(sprint => ({radius: 15}));
  }, [pastSprints, sprints]);

  const ticked = useCallback(() => {
    if (!svg.current) return;
    const u = select(svg.current)
      .selectAll("circle")
      .data(sprintNodes);
    u.enter()
      .append("circle")
      .attr("r", 10)
      .merge(u as unknown as Selection<SVGCircleElement, any, SVGSVGElement, unknown>)
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);
    u.exit().remove();
  }, [sprintNodes]);
  
  const simulation = useMemo(() => {
    forceSimulation(sprintNodes as SimulationNodeDatum[])
      .force("charge", forceManyBody())
      .force("center", forceCenter(width/2, props.height/2))
      .on("tick", ticked);
  }, [props.height, sprintNodes, ticked, width]);

  return (
    <Figure ref={container} className={`${props.className ? props.className : ""} figure-img d-block`}>
      <svg className="chart chart-bubbles" ref={svg} height={props.height} width={width} viewBox={`0 0 ${width} ${props.height}`}>
        <g className="root"></g>
      </svg>
    </Figure>
  );
}

export default BubbleChart;