import { SET_PRICE } from "../types/prices.types";

const setPrice = (price) => {
  return async (dispatch) => {
    try {
      dispatch(setPriceRequest(price));
    } catch (error) {
      throw error;
    }
  };
};

function setPriceRequest(price) {
  return { type: SET_PRICE, price };
}

export const priceActions = {
  setPrice,
};
