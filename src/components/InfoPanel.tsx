import classNames from "classnames";
import React from "react";
import { Badge, BadgeProps, Card, Image, Table } from "react-bootstrap";
import { useSelector } from "react-redux";

import { RootState } from "..";
import { configSelector } from "../slices/config";
import { selectIssueById } from "../slices/issues";
import { selectIssueTypeById, IssueTypes } from "../slices/issueTypes";
import { StatusCategories, selectStatusCategoryById } from "../slices/statusCategories";
import { selectStatusById } from "../slices/statuses";

interface Props {
  className?: string,
  issueId: number,
}

const InfoPanel = (props: Props) => {

  const variants = new Map<number, BadgeProps["variant"]>([
    [StatusCategories.NoCategory, "light"],
    [StatusCategories.ToDo, "info"],
    [StatusCategories.Done, "success"],
    [StatusCategories.InProgress, "primary"],
  ]);

  const { unestimatedSize } = useSelector(configSelector);
  const issue = useSelector((state: RootState) => selectIssueById(state, props.issueId));
  const issueType = useSelector((state: RootState) => selectIssueTypeById(state, issue ? issue.issueTypeId : -1));
  const parentIssue = useSelector((state: RootState) => selectIssueById(state, issue && issue.parentId ? issue.parentId : -1));
  const status = useSelector((state: RootState) => selectStatusById(state, issue ? issue.statusId : -1));
  const statusCategory = useSelector((state: RootState) => selectStatusCategoryById(state, status ? status.statusCategoryId : -1));

  if (!issue) {
    return(
      <Card className={classNames(props.className)}>
        <Card.Header>No issue found</Card.Header>
        <Card.Body>
          <Card.Text>Issue details unavailable.</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return(
    <Card className={classNames(props.className)}>
      <Card.Header className="d-flex align-items-center">
        <Image className="issue-type-icon mr-2" src={issueType?.iconURL || "https://via.placeholder.com/16x16"}/>
        <span>{issueType?.name || "Unknown"}</span>
      </Card.Header>
      <Card.Body>
        <Card.Title className="justify-content-between">
          <span className="mr-2">{issue.key}</span>
          <Badge 
            className="text-uppercase"
            variant={statusCategory ? variants.get(statusCategory.id) : "light"}>
            {status?.name || "Unknown"}
          </Badge>
        </Card.Title>
        <Card.Subtitle className="text-muted mb-2">
          Created: {new Date(issue.created).toLocaleString("nl-NL")}
        </Card.Subtitle>
        <Card.Text>
          {issue.summary}
        </Card.Text>
      </Card.Body>
      <Table className="mb-0">
        <tbody>
          {
            IssueTypes.Epic === issueType?.id &&
            <>
              <tr>
                <td>Story Points (aggregate)</td>
                <td>43</td>
              </tr>
              <tr>
                <td>Issues in Epic</td>
                <td>10</td>
              </tr>
            </>
          }
          {
            issue.parentId &&
            <tr>
              <td>Parent Issue</td>
              <td>{parentIssue!.key}</td>
            </tr>
          }
          {
            issue.storyPoints
            ? <tr>
                <td>Story Points</td>
                <td>{issue.storyPoints}</td>
              </tr>
            : <tr>
                <td>Story Points (estimated)</td>
                <td>{unestimatedSize}</td>
              </tr>
          }
        </tbody>
      </Table>
    </Card>
  );
}

export default InfoPanel;