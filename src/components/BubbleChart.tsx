import classNames from "classnames";
import { event, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, mouse, select, zoom } from "d3";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Col, Collapse, Container, Figure, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { LoginStatus, authSelector } from "../slices/auth";
import { configSelector } from "../slices/config";
import { fetchIssueLinkTypes, selectIssueLinkTypeEntities } from "../slices/issueLinkTypes";
import { fetchIssueTypes, selectIssueTypeEntities } from "../slices/issueTypes";
import { Issue, fetchIssues, selectAllIssues, selectIssueEntities, selectIssueById } from "../slices/issues";
import { fetchSprints, selectAllSprints } from "../slices/sprints";
import { fetchStatusCategories } from "../slices/statusCategories";
import { fetchStatuses, selectStatusEntities } from "../slices/statuses";
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
  const { boardId, pastSprints, showUnestimatedIssues, unestimatedSize } = useSelector(configSelector);
  const sprints = useSelector(selectAllSprints);
  const issues = useSelector(selectAllIssues);
  const issueEntities = useSelector(selectIssueEntities);
  const issueTypeEntities = useSelector(selectIssueTypeEntities);

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

  // Fetch issues after board has changed.
  useEffect(() => {
    if (!boardId) return;
    dispatch(fetchIssues({boardId: boardId}));
  }, [boardId, dispatch]);

  const arrowHeads = useMemo(() => {
    const reducer = (acc: number[], cur: Issue, idx: number, src: Issue[]) => {
      if (cur.storyPoints && !acc.includes(cur.storyPoints)) {
        acc.push(cur.storyPoints);
      }
      return acc;
    }
    return issues.reduce(reducer, []);
  }, [issues]);

  const issueLinks = useMemo(() => {
    const reducer = (acc: Link[], cur: Issue, idx: number, src: Issue[]) => {
      cur.links
        .filter(link => "outward" === link.direction)
        .forEach(link => {
        if (issues.some(issue => issue.id === link.issueId)) {
          acc.push({
            id: link.id,
            source: cur.id,
            target: link.issueId,
          });
        }
      });
      return acc;
    }
    return issues
      .reduce(reducer, [])
      .map(issueLink => Object.create(issueLink));
  }, [issues]);

  const taskLinks = useMemo(() => {
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
      .map(taskLink => Object.create(taskLink));
  }, [issues]);
  
  const nodes = useMemo(() => {
    return issues
      .map(issue => Object.create({id: issue.id}))
    }, [issues]);

  const simulation = useMemo(() => {
    return forceSimulation(nodes)
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
  }, [issueEntities, issueLinks, taskLinks, nodes, unestimatedSize]);

  const arrowHead = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select("defs")
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

  const node = useMemo(() => {
    if (!svg.current) return;
    const chart = select(svg.current);
    return chart.select(".nodes")
      .selectAll("circle")
      .data(nodes, (d: any) => d.id)
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
  }, [issueEntities, issueTypeEntities, nodes, unestimatedSize]);

  useEffect(() => {
    if (!issueLink || !taskLink || !node) return;
    simulation.on("tick", () => {
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
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    })
  }, [issueLink, node, simulation, taskLink]);

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
    if (!container.current || !svg.current || !issues.length) return;
    select(svg.current)
      .selectAll("circle")
        .on("mouseover", (d: any) => {
          setCurrentIssueId(d.id)
          select(container.current)
            .select(".info-panel")
              .classed("d-none", false);
        })
        .on("mousemove", (d: any) => {
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
  }, [issueEntities, issues, props.height, width]);

  return (
    <Container ref={container} className={classNames(props.className, "p-0")} fluid>
      <Collapse in={!!boardId && !issues.length} unmountOnExit>
        <Row>
          <Col>
            <Alert variant="info">
              <Spinner animation="border" className="mr-2" size="sm" />Fetching data from JIRA...            
            </Alert>
          </Col>
        </Row>
      </Collapse>
      <Collapse in={!!issues.length}>
        <Row>
          <Col>
            <InfoPanel className="info-panel d-none" issueId={currentIssueId} />
            <Figure className="figure-img d-block">
              <svg className="chart chart-bubbles" ref={svg} height={props.height} width={width} viewBox={`${-width/2} ${-props.height/2} ${width} ${props.height}`}>
                <defs></defs>
                <g className="root">
                  <g className="issueLinks"></g>
                  <g className="taskLinks"></g>
                  <g className="nodes"></g>
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