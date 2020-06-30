import { createSlice } from '@reduxjs/toolkit';

interface State {
  boardId?: number,
  pastSprints: number,
  showUnestimatedIssues: boolean,
  unestimatedSize: number,
}

const initialState: State = {
  pastSprints: 5,
  showUnestimatedIssues: true,
  unestimatedSize: 5,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setBoard: (state: State, { payload }: { payload: number }) => {
      state.boardId = payload
    },
    setPastSprints: (state: State, { payload }: { payload: number }) => {
      state.pastSprints = payload
    },
    setUnestimatedSize: (state: State, { payload }: { payload: number }) => {
      state.unestimatedSize = payload
    },
    toggleUnestimatedIssues: (state: State) => {
      state.showUnestimatedIssues = !state.showUnestimatedIssues
    },
  },
});

export const { setBoard, setPastSprints, setUnestimatedSize, toggleUnestimatedIssues } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;
