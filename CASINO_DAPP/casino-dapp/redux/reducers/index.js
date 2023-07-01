import { combineReducers } from "redux";
import { prices } from "./prices.reducers";
import { loader } from "./loader.reducers";
import { balances } from "./balances.reducers";

export const reducers = combineReducers({
  loader,
  prices,
  balances
});
