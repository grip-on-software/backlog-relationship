import classNames from "classnames";
import { event, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, mouse, select, zoom } from "d3";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Col, Collapse, Container, Figure, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { LoginStatus, authSelector } from "../slices/auth";
import { configSelector } from "../slices/config";
import { fetchIssueLinkTypes } from "../slices/issueLinkTypes";
import { fetchIssueTypes, selectIssueTypeEntities } from "../slices/issueTypes";
import { Issue, fetchIssuesForSprint, selectAllIssues, selectIssueEntities, selectIssueIds } from "../slices/issues";
import { fetchSprints, selectAllSprints, selectSprintEntities, selectSprintIds } from "../slices/sprints";
import { fetchStatusCategories } from "../slices/statusCategories";
import { fetchStatuses } from "../slices/statuses";
import InfoPanel from "./InfoPanel";

interface Link {
  id?: number,
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
  const { loginStatus } = useSelector(authSelector);
  const { boardId, numberOfPastSprintsToShow, showUnestimatedIssues, unestimatedSize } = useSelector(configSelector);
  const sprints = useSelector(selectAllSprints);
  const sprintEntities = useSelector(selectSprintEntities);
  const sprintIds = useSelector(selectSprintIds);
  const issues = useSelector(selectAllIssues);
  const issueEntities = useSelector(selectIssueEntities);
  const issueIds = useSelector(selectIssueIds);
  const issueTypeEntities = useSelector(selectIssueTypeEntities);

  // Maintain references to container and main SVG element.
  const container = useRef<(HTMLDivElement)>(null);
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

  // Maintain reference to current issue.
  const [currentIssueId, setCurrentIssueId] = useState(-1);

  // Fetch issue link types on initialization.
  useEffect(() => {
    if (LoginStatus.LoggedIn !== loginStatus) return;
    dispatch(fetchIssueLinkTypes());
  }, [dispatch, loginStatus]);

  // Fetch issue types on initialization.
  useEffect(() => {
    if (LoginStatus.LoggedIn !== loginStatus) return;
    dispatch(fetchIssueTypes());
  }, [dispatch, loginStatus]);

  // Fetch status categories on initialization.
  useEffect(() => {
    if (LoginStatus.LoggedIn !== loginStatus) return;
    dispatch(fetchStatusCategories());
  }, [dispatch, loginStatus]);

  // Fetch statuses on initialization.
  useEffect(() => {
    if (LoginStatus.LoggedIn !== loginStatus) return;
    dispatch(fetchStatuses());
  }, [dispatch, loginStatus]);

  // Fetch sprints after board has changed.
  useEffect(() => {
    if (!boardId) return;
    dispatch(fetchSprints({boardId: boardId}));
  }, [boardId, dispatch]);

  const lastSprintIds = useMemo(() => {
    return sprintIds.slice(0, numberOfPastSprintsToShow);
  }, [numberOfPastSprintsToShow, sprintIds]);

  // Fetch issues after sprints have changed.
  useEffect(() => {
    lastSprintIds.forEach(sprintId => dispatch(fetchIssuesForSprint({sprintId: sprintId as number})))
  }, [dispatch, lastSprintIds]);

  // Get filtered issues based on configuration.
  const configuredIssueIds = useMemo(() => {
    return (issueIds as number[])
      .filter(issueId => showUnestimatedIssues ? true : issueEntities[issueId]!.storyPoints)
      .filter(issueId => lastSprintIds
        .some(sprintId => 
          issueEntities[issueId]!.sprintId === sprintId || 
          issueEntities[issueId]!.closedSprintIds.includes(sprintId as number)));
  }, [issueEntities, issueIds, lastSprintIds, showUnestimatedIssues]);

  // Declare arrowheads for issue relationships.
  const arrowHeads = useMemo(() => {
    const reducer = (acc: number[], cur: number, idx: number, src: number[]) => {
      const currentIssue = issueEntities[cur]!;
      if (currentIssue.storyPoints && !acc.includes(currentIssue.storyPoints)) {
        acc.push(currentIssue.storyPoints);
      }
      return acc;
    }
    return configuredIssueIds.reduce(reducer, []);
  }, [configuredIssueIds, issueEntities]);

  const issueLinks = useMemo(() => {
    const reducer = (acc: Link[], cur: number, idx: number, src: number[]) => {
      const currentIssue = issueEntities[cur]!;
      currentIssue.links
        .filter(link => "outward" === link.direction)
        .forEach(link => {
          if (configuredIssueIds.some(issueId => issueId === link.issueId)) {
            acc.push({
              id: link.id,
              source: currentIssue.id,
              target: link.issueId,
            });
          }
        });
      return acc;
    }
    return configuredIssueIds
      .reduce(reducer, [])
      .map(issueLink => Object.create(issueLink));
  }, [configuredIssueIds, issueEntities]);

  const taskLinks = useMemo(() => {
    const reducer = (acc: Link[], cur: number, idx: number, src: number[]) => {
      const currentIssue = issueEntities[cur]!;
      if (currentIssue.parentId && configuredIssueIds.some(issueId => issueId === currentIssue.parentId)) {
        acc.push({
          source: currentIssue.parentId,
          target: currentIssue.id,
        });
      }
      return acc;
    }
    return configuredIssueIds
      .reduce(reducer, [])
      .map(taskLink => Object.create(taskLink));
  }, [configuredIssueIds, issueEntities]);
  
  const issueNodes = useMemo(() => {
    return configuredIssueIds
      .map(issueId => Object.create({id: issueId}))
    }, [configuredIssueIds]);

  const issueSimulation = useMemo(() => {
    return forceSimulation(issueNodes)
      .force("issueLink", forceLink(issueLinks)
        .id((d: any) => d.id)
      )
      .force("taskLink", forceLink(taskLinks)
        .id((d: any) => d.id)
      )
      .force("charge", forceManyBody()
        .strength((d: any) => {
          const issue = issueEntities[d.id]!;
          if (issue.storyPoints) {
            return -30 - issue.storyPoints;
          }
          return -30 - unestimatedSize;
        })
      )
      .force("collision", forceCollide()
        .radius((d: any) => {
          const issue = issueEntities[d.id]!;
          if (issue.storyPoints) {
            return issue.storyPoints;
          }
          return unestimatedSize;
        })
      )
      .force("x", forceX())
      .force("y", forceY());
  }, [issueEntities, issueLinks, taskLinks, issueNodes, unestimatedSize]);

  const issueLink = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select(".issueLinks")
      .selectAll("line")
      .data(issueLinks, (d: any) => `issueLink-${d.id}`)
      .join("line")
        .attr("class", "issueLink")
        .attr("marker-end", (d: any) => {
          const { storyPoints } = issueEntities[d.target.id]!;
          if (storyPoints) {
            return `url(#arrowHead-${storyPoints})`;
          }
          return `url(#arrowHead-${unestimatedSize})`;
        });
  }, [issueEntities, issueLinks, unestimatedSize]);

  const taskLink = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select(".taskLinks")
      .selectAll("line")
      .data(taskLinks, (d: any) => `taskLink-${d.source.id}-${d.target.id}`)
      .join("line")
        .attr("class", "taskLink");
  }, [taskLinks]);

  const issueNode = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select(".issues")
      .selectAll("circle")
      .data(issueNodes, (d: any) => d.id)
      .join("circle")
        .attr("class", d => {
          let issueTypeId;
          try {
            issueTypeId = issueTypeEntities[issueEntities[d.id]!.issueTypeId]!.id;
          } catch {
            issueTypeId = 1;
          } finally {
            return `issuetype-${issueTypeId}`;
          }
        })
        .attr("r", (d: any) => {
          const { storyPoints } = issueEntities[d.id]!;
          if (storyPoints) {
            return storyPoints;
          }
          return unestimatedSize;
        })
  }, [issueEntities, issueTypeEntities, issueNodes, unestimatedSize]);

  useEffect(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    chart.select("defs")
      .selectAll("marker")
      .data(arrowHeads, d => `arrowHead-${d}`)
      .join("marker")
        .attr("id", d => `arrowHead-${d}`)
        .attr("markerHeight", "5")
        .attr("markerWidth", "5")
        .attr("orient", "auto-start-reverse")
        .attr("refX", d => d * 2 + 9)
        .attr("refY", "5")
        .attr("viewBox", "0 0 10 10")
      .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z");
  }, [arrowHeads]);

  useEffect(() => {
    if (!issueLink || !taskLink || !issueNode) return;
    issueSimulation.on("tick", () => {
      issueLink
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      taskLink
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      issueNode
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    })
  }, [issueLink, issueNode, issueSimulation, taskLink]);

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

  useEffect(() => {
    if (!container.current || !svg.current || !configuredIssueIds.length) return;
    select(svg.current)
      .selectAll("circle")
        .on("mouseover", (d: any) => {
          setCurrentIssueId(d.id);
          select(container.current)
            .select(".info-panel")
              .classed("d-none", false);
        })
        .on("mousemove", (d: any) => {
          if (event.ctrlKey || event.metaKey) {
            console.log("ye");
          }
          const position = {
            left: mouse(svg.current!)[0] + width/2 + 50,
            top: mouse(svg.current!)[1] + props.height/2 - 128,
          };
          select(container.current)
            .select(".info-panel")
              .attr("style", `left: ${position.left}px; top: ${position.top}px`);
        })
        .on("mouseout", () => {
          select(container.current)
            .select(".info-panel")
              .classed("d-none", true);
        })
        .on("click", (d: any) => {
          const issue = issueEntities[d.id]!;
          if (event.ctrlKey || event.metaKey) {
            window.open(`${process.env.REACT_APP_JIRA_URL}/browse/${issue.key}`, "_blank");
          }
        })
  }, [issueEntities, configuredIssueIds, props.height, width]);

  return (
    <Container ref={container} className={classNames(props.className, "p-0")} fluid>
      <Collapse in={!!boardId && !configuredIssueIds.length} unmountOnExit>
        <Row>
          <Col>
            <Alert variant="info">
              <Spinner animation="border" className="mr-2" size="sm" />Fetching data from JIRA...            
            </Alert>
          </Col>
        </Row>
      </Collapse>
      <Collapse in={!!configuredIssueIds.length}>
        <Row>
          <Col>
            <InfoPanel className="info-panel d-none" issueId={currentIssueId} />
            <Figure className="figure-img d-block">
              <svg className="chart chart-bubbles" ref={svg} height={props.height} width={width} viewBox={`${-width/2} ${-props.height/2} ${width} ${props.height}`}>
                <defs></defs>
                <g className="root">
                  <g className="issueLinks"></g>
                  <g className="taskLinks"></g>
                  <g className="issues"></g>
                </g>
              </svg>
            </Figure>
          </Col>
        </Row>
      </Collapse>
    </Container>
  );
}

export default BubbleChart;