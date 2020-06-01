import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { addAlert } from './alerts';

export interface Project {
  id: number,
  key: string,
  label: string,
};

export interface Release {
  id: number,
  label: string,
}

interface State {
  pastSprints: number,
  project: Project | null,
  projects: Project[],
  showUnestimatedIssues: boolean,
  unestimatedSize: number,
}

const initialState: State = {
  pastSprints: 5,
  project: null,
  projects: [],
  showUnestimatedIssues: true,
  unestimatedSize: 1,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setPastSprints: (state: State, { payload }: { payload: number }) => {
      state.pastSprints = payload
    },
    setProject: (state: State, { payload }: { payload: Project | null }) => {
      state.project = payload
    },
    setProjects: (state: State, { payload }: { payload: any[] }) => {
      state.projects = payload.map(project => ({
        id: parseInt(project["id"]),
        key: project["key"],
        label: project["name"],
      }) as Project);
    },
    setUnestimatedSize: (state: State, { payload }: { payload: number }) => {
      state.unestimatedSize = payload
    },
    toggleUnestimatedIssues: (state: State) => {
      state.showUnestimatedIssues = !state.showUnestimatedIssues
    },
  },
});

export const { setPastSprints, setProject, setProjects, setUnestimatedSize, toggleUnestimatedIssues } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;

export const fetchProjects = () => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await fetch("data/project.json");
      const data: any[] = await response.json();
      dispatch(setProjects(data));
    } catch (error) {
      console.error(error);
      dispatch(addAlert({
        dismissible: false,
        message: "Something went wrong while fetching projects. Please reload the page.",
        variant: "danger"
      }));
    }
  }
}
