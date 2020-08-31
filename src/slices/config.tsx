import { createSlice } from '@reduxjs/toolkit';

interface State {
  boardId?: number,
  date: number,
  numberOfPastSprintsToShow: number,
  showUnestimatedIssues: boolean,
  unestimatedSize: number,
}

const initialState: State = {
  date: 0,
  numberOfPastSprintsToShow: 3,
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
    setDate: (state: State, { payload }: { payload: number }) => {
      state.date = payload
    },
    setNumberOfPastSprintsToShow: (state: State, { payload }: { payload: number }) => {
      state.numberOfPastSprintsToShow = payload
    },
    setUnestimatedSize: (state: State, { payload }: { payload: number }) => {
      state.unestimatedSize = payload
    },
    toggleUnestimatedIssues: (state: State) => {
      state.showUnestimatedIssues = !state.showUnestimatedIssues
    },
  },
});

export const { setBoard, setDate, setNumberOfPastSprintsToShow, setUnestimatedSize, toggleUnestimatedIssues } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;
