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
  projects: Project[],
}

const initialState: State = {
  projects: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setProjects: (state: State, { payload }: { payload: any[] }) => {
      state.projects = payload.map(project => ({
        id: parseInt(project["id"]),
        key: project["key"],
        label: project["name"],
      }) as Project);
    },
  },
});

export const { setProjects } = dataSlice.actions;
export const dataSelector = (state: any) => state.data as State;
export default dataSlice.reducer;

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
