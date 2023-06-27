import { combineReducers } from "redux";
import { prices } from "./prices.reducers";
import { loader } from "./loader.reducers";

export const reducers = combineReducers({
  loader,
  prices,
});
