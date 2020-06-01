import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { configSelector, setProject } from '../slices/config'; 
import { Project, dataSelector, fetchProjects } from '../slices/data'; 

import { Form } from 'react-bootstrap';
import { Highlighter, Typeahead, TypeaheadMenuProps, TypeaheadResult } from 'react-bootstrap-typeahead';

interface Props {
  className?: string,
};

const ProjectTypeahead = (props: Props) => {
  const dispatch = useDispatch();
  const { project } = useSelector(configSelector);
  const { projects } = useSelector(dataSelector);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleChange = (selected: Project[]) => selected.length ? dispatch(setProject(selected[0])) : null;

  const renderMenuItem = (project: TypeaheadResult<Project>, props: TypeaheadMenuProps<Project>, idx: number) => {
    return(
      <Fragment>
        <Highlighter key={project.key} search={props.text}>{project.key}</Highlighter>
        <div className="text-muted" key="title">
          <small>{project.label}</small>
        </div>
      </Fragment>
    )
  };

  return (
    <div className={props.className || ""}>
      <Form>
        <Form.Group controlId="project">
          <Typeahead
            bsSize="lg"
            id="project"
            labelKey="key"
            options={projects}
            onChange={handleChange}
            placeholder="Find a project..."
            renderMenuItemChildren={renderMenuItem} />
        </Form.Group>
        <h6 className="text-muted card-subtitle mb-2">
          {project ? project.label : "No project selected"}
        </h6>
      </Form>
    </div>
  );
};

export default ProjectTypeahead;