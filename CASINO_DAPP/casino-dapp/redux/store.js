// OLD CODE
// import { createStore, applyMiddleware } from "redux";
// import thunk from "redux-thunk";

// const initStore = () => {
//   return createStore(reducers, applyMiddleware(thunk));
// };
///////

import { configureStore } from "@reduxjs/toolkit";
import { reducers } from "./reducers";
import { createWrapper } from "next-redux-wrapper";

const initStore = () => {
  //return createStore(reducers, applyMiddleware(thunk));
  return configureStore({ reducer: reducers });
};

const wrapper = createWrapper(initStore);

export default wrapper;
