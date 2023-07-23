import { SET_BALANCES } from '../types/balances.types'

const initialState = {
  USER_TOKENS: '0',
  USER_TOKENS_VALUE: '0',
  USER_TOKENS_IWALLET: '0',
  USER_TOKENS_VALUE_IWALLET: '0',
}

export const balances = (state = initialState, action) => {
  switch (action.type) {
    case SET_BALANCES:
      return {
        ...state,
        USER_TOKENS: action.balances.USER_TOKENS,
        USER_TOKENS_VALUE: action.balances.USER_TOKENS_VALUE,
        USER_TOKENS_IWALLET: action.balances.USER_TOKENS_IWALLET,
        USER_TOKENS_VALUE_IWALLET: action.balances.USER_TOKENS_VALUE_IWALLET,
      }
    default:
      return state
  }
}
