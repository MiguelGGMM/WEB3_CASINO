import { SET_LOADER } from "../types/loader.types";

const setLoader = (loader) => {
  return async (dispatch) => {
    try {
      dispatch(setLoaderRequest(loader));
    } catch (error) {
      throw error;
    }
  };
};

function setLoaderRequest(loader) {
  return { type: SET_LOADER, loader };
}

export const loaderActions = {
  setLoader,
};
