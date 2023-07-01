import { SET_BALANCES } from "../types/balances.types";

const setBalances = (balances) => {
  return async (dispatch) => {
    try {
      dispatch(setBalancesRequest(balances));
    } catch (error) {
      throw error;
    }
  };
};

function setBalancesRequest(balances) {
  return { type: SET_BALANCES, balances };
}

export const balancesActions = {
    setBalances,
};
