import { createSlice } from '@reduxjs/toolkit';

import { Project } from './data';

interface State {
  pastSprints: number,
  project: Project | null,
  showUnestimatedIssues: boolean,
  unestimatedSize: number,
}

const initialState: State = {
  pastSprints: 5,
  project: null,
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
    setUnestimatedSize: (state: State, { payload }: { payload: number }) => {
      state.unestimatedSize = payload
    },
    toggleUnestimatedIssues: (state: State) => {
      state.showUnestimatedIssues = !state.showUnestimatedIssues
    },
  },
});

export const { setPastSprints, setProject, setUnestimatedSize, toggleUnestimatedIssues } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;
