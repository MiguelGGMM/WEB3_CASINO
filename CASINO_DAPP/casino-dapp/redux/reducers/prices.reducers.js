import { SET_PRICE } from '../types/prices.types'

const initialState = {
  wbtc: null,
  dream: null,
  eth: null,
  bnb: null,
}

export const prices = (state = initialState, action) => {
  switch (action.type) {
    case SET_PRICE:
      return {
        ...state,
        [action.price.token]: action.price.price,
      }
    default:
      return state
  }
}
