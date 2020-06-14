import { event, forceLink, forceManyBody, forceSimulation, forceX, forceY, select, zoom, SimulationNodeDatum } from "d3";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Figure } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { configSelector } from "../slices/config";
import { Issue, fetchIssues, selectAllIssues } from "../slices/issues";
import { fetchSprints, selectAllSprints } from "../slices/sprints";

interface Link {
  source: number,
  target: number,
}

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
  const { boardId, pastSprints } = useSelector(configSelector);
  const sprints = useSelector(selectAllSprints);
  const issues = useSelector(selectAllIssues);

  // Maintain references to container and main SVG element.
  const container = useRef<(HTMLElement & Figure<"figure">)>(null);
  const svg = useRef<SVGSVGElement>(null);
  
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

  // Fetch sprints after board has changed.
  useEffect(() => {
    if (!boardId) return;
    dispatch(fetchSprints({boardId: boardId}));
  }, [boardId, dispatch]);

  // Fetch issues after board has changed.
  useEffect(() => {
    if (!boardId) return;
    dispatch(fetchIssues({boardId: boardId}));
  }, [boardId, dispatch]);

  const links = useMemo(() => {
    const reducer = (acc: Link[], cur: Issue, idx: number, src: Issue[]) => {
      if (cur.parentId && issues.some(issue => issue.id === cur.parentId)) {
        acc.push({
          source: cur.parentId,
          target: cur.id,
        });
      }
      return acc;
    }
    return issues
      .reduce(reducer, [])
      .map(link => Object.create(link));
  }, [issues]);
  
  const nodes = useMemo(() => issues.map(node => Object.create(node)), [issues]);

  const simulation = useMemo(() => {
    return forceSimulation(nodes)
      .force("link", forceLink(links).id((d: any) => d.id))
      .force("charge", forceManyBody())
      .force("x", forceX())
      .force("y", forceY());
  }, [nodes, links]);

  const link = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select(".links")
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("class", "link");
  }, [links]);

  const node = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select(".nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("class", d => d.issueTypeId)
        .attr("r", d => d.statusId);
  }, [nodes]);

  useEffect(() => {
    if (!link || !node) return;
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    })
  }, [link, node, simulation]);

  useEffect(() => {
    if (!svg.current) return;
    const chart = select(svg.current as Element);
    chart
      .call(
        zoom()
          .extent([[0, 0], [width, props.height]])
          .scaleExtent([0.5, 5])
          .on("zoom", () => chart
            .select(".root")
            .attr("transform", event.transform))
      )
      .on("wheel", () => event.preventDefault());
  }, [props.height, width]);

  return (
    <Figure ref={container} className={`${props.className ? props.className : ""} figure-img d-block`}>
      <svg className="chart chart-bubbles" ref={svg} height={props.height} width={width} viewBox={`${-width/2} ${-props.height/2} ${width} ${props.height}`}>
        <g className="root">
          <g className="links"></g>
          <g className="nodes"></g>
        </g>
      </svg>
    </Figure>
  );
}

export default BubbleChart;