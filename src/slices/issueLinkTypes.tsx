import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

export enum IssueLinkTypes {
  Blocks = 10000,
  Clones,
  Duplicates,
  Relates,
  Tests = 10200,
  Details,
  Extends,
  Changes = 10400,
  Realizes = 10500,
  Splits = 10600,
}

export interface IssueLinkType {
  id: number,
  name: string,
  inward: string,
  outward: string,
};

interface IssueLinkTypeSchema {
  issueLinkTypes: {
    id: string,
    name: string,
    inward: string,
    outward: string,
    self: string,
  }[]
}

export const fetchIssueLinkTypes = createAsyncThunk(
  "issueLinkTypes/fetch",
  async () => {
    return jira.issueLinkType.getAvailableTypes() as Promise<IssueLinkTypeSchema>;
  }
);

const issueLinkTypesAdapter = createEntityAdapter<IssueLinkType>();

const issueLinkTypesSlice = createSlice({
  name: "issueLinkTypes",
  initialState: issueLinkTypesAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      fetchIssueLinkTypes.fulfilled,
      (state: EntityState<IssueLinkType>, { payload }: { payload: IssueLinkTypeSchema }) => {
        issueLinkTypesAdapter.addMany(
          state,
          payload.issueLinkTypes.map(
            issueLinkTypeSchema => ({
              id: parseInt(issueLinkTypeSchema.id),
              name: issueLinkTypeSchema.name,
              inward: issueLinkTypeSchema.inward,
              outward: issueLinkTypeSchema.outward,
            }) as IssueLinkType
          )
        )
      }
    );
  },
});

export const {
  selectById: selectIssueLinkTypeById,
  selectEntities: selectIssueLinkTypeEntities,
} = issueLinkTypesAdapter.getSelectors<RootState>(state => state.issueLinkTypes);

export default issueLinkTypesSlice.reducer;