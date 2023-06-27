export const prizeType = {
    none: 0,
    x2reward:  1,
    x5reward: 2,
    x10reward: 3,
    freeSpin: 4,               // the tokens you used to bet will be returned to you
    customPrizeDollarAmount: 5,
    NFT: 6
} as const

/**
 * This depends on contract config
 */
// export const customDollarPrizeSubtype = {
//     '1$': 4,
//     '2$': 5
// } as const

export type prizeTypeOptions = typeof prizeType[keyof typeof prizeType]

export const betType = {
    none: 0,
    paid: 1
} as const

export const betState = {
    none: 0,
    pending: 1,
    solved: 2,
    claimed: 3,
    cancelled: 4                            // tokens will be returned to user
} as const