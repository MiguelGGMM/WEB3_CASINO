import { SET_LOADER } from "../types/loader.types";

const initialState = {
  loader: null,
};

export const loader = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADER:
      return {
        ...state,
        loader: action.loader,
      };
    default:
      return state;
  }
};
