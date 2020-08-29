import classNames from "classnames";
import { event, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, mouse, select, zoom } from "d3";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Col, Collapse, Container, Figure, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { LoginStatus, authSelector } from "../slices/auth";
import { configSelector } from "../slices/config";
import { fetchIssueLinkTypes } from "../slices/issueLinkTypes";
import { fetchIssueTypes, selectIssueTypeEntities } from "../slices/issueTypes";
import { Issue, fetchIssues, selectAllIssues, selectIssueEntities } from "../slices/issues";
import { fetchSprints, selectAllSprints, selectSprintEntities } from "../slices/sprints";
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
  const { boardId, numberOfPastSprints, showUnestimatedIssues, unestimatedSize } = useSelector(configSelector);
  const sprints = useSelector(selectAllSprints);
  const sprintEntities = useSelector(selectSprintEntities);
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

  // Get list of sprints sorted by .
  const pastSprints = useMemo(() => {
    return sprints.sort((a, b) => {
      if (a.completeDate) {
        if (b.completeDate) {
          return a.completeDate - b.completeDate;
        } else {
          return -1;
        }
      } else {
        if (b.completeDate) {
          return 1;
        } else {
          return a.id - b.id;
        }
      }
    });
  }, [sprints]);

  // Get filtered issues based on configuration.
  const configuredIssues = useMemo(() => {
    return issues
      .filter(issue => showUnestimatedIssues ? true : issue.storyPoints)
      .filter(issue => pastSprints
        .slice(-numberOfPastSprints)
        .some(sprint => issue.sprintId === sprint.id || issue.closedSprintIds.includes(sprint.id)));
  }, [issues, numberOfPastSprints, pastSprints, showUnestimatedIssues]);

  const arrowHeads = useMemo(() => {
    const reducer = (acc: number[], cur: Issue, idx: number, src: Issue[]) => {
      if (cur.storyPoints && !acc.includes(cur.storyPoints)) {
        acc.push(cur.storyPoints);
      }
      return acc;
    }
    return configuredIssues.reduce(reducer, []);
  }, [configuredIssues]);

  const issueLinks = useMemo(() => {
    const reducer = (acc: Link[], cur: Issue, idx: number, src: Issue[]) => {
      cur.links
        .filter(link => "outward" === link.direction)
        .forEach(link => {
        if (configuredIssues.some(issue => issue.id === link.issueId)) {
          acc.push({
            id: link.id,
            source: cur.id,
            target: link.issueId,
          });
        }
      });
      return acc;
    }
    return configuredIssues
      .reduce(reducer, [])
      .map(issueLink => Object.create(issueLink));
  }, [configuredIssues]);

  const taskLinks = useMemo(() => {
    const reducer = (acc: Link[], cur: Issue, idx: number, src: Issue[]) => {
      if (cur.parentId && configuredIssues.some(issue => issue.id === cur.parentId)) {
        acc.push({
          source: cur.parentId,
          target: cur.id,
        });
      }
      return acc;
    }
    return configuredIssues
      .reduce(reducer, [])
      .map(taskLink => Object.create(taskLink));
  }, [configuredIssues]);
  
  const issueNodes = useMemo(() => {
    return configuredIssues
      .map(issue => Object.create({id: issue.id}))
    }, [configuredIssues]);

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
    if (!container.current || !svg.current || !configuredIssues.length) return;
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
  }, [issueEntities, configuredIssues, props.height, width]);

  return (
    <Container ref={container} className={classNames(props.className, "p-0")} fluid>
      <Collapse in={!!boardId && !configuredIssues.length} unmountOnExit>
        <Row>
          <Col>
            <Alert variant="info">
              <Spinner animation="border" className="mr-2" size="sm" />Fetching data from JIRA...            
            </Alert>
          </Col>
        </Row>
      </Collapse>
      <Collapse in={!!configuredIssues.length}>
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