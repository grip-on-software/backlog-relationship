import { createSlice } from '@reduxjs/toolkit';

interface State {
  boardId?: number,
  numberOfPastSprints: number,
  showUnestimatedIssues: boolean,
  unestimatedSize: number,
}

const initialState: State = {
  numberOfPastSprints: 5,
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
    setNumberOfPastSprints: (state: State, { payload }: { payload: number }) => {
      state.numberOfPastSprints = payload
    },
    setUnestimatedSize: (state: State, { payload }: { payload: number }) => {
      state.unestimatedSize = payload
    },
    toggleUnestimatedIssues: (state: State) => {
      state.showUnestimatedIssues = !state.showUnestimatedIssues
    },
  },
});

export const { setBoard, setNumberOfPastSprints, setUnestimatedSize, toggleUnestimatedIssues } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;
