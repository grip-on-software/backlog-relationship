import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { addAlert } from './alerts';

export interface Project {
  isCore: boolean,
  isRecent: boolean,
  key: string,
  label: string,
  releases: Release[],
};

export interface Release {
  id: number,
  label: string,
}

interface State {
  project: Project | null,
  projects: Project[],
}

const initialState: State = {
  project: null,
  projects: [],
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setProject: (state: State, { payload }: { payload: Project | null }) => {
      state.project = payload
    },
    setProjects: (state: State, { payload }: { payload: Project[] }) => {
      state.projects = payload
    },
  },
});

export const { setProject, setProjects } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;

export const fetchProjects = () => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await fetch("data/projects.json");
      const data: Project[] = await response.json();
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
