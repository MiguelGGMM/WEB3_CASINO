import { prizeType } from "./const"

export type web3Error = {
    reason?: string,
    message?: string,
    data?: { message?: string }
}

export const prizeTypeText = {
    [prizeType.none]: "lose",
    [prizeType.x2reward]: "x2 Reward",
    [prizeType.x5reward]: "x5 Reward",
    [prizeType.x10reward]: "x10 Reward",
    [prizeType.freeSpin]: "Free Spin",               
    [prizeType.customPrizeDollarAmount]: "", //TODO...
    [prizeType.NFT]: "NFT"
}

export const winPrefix = "WON!";
export const losePrefix = "lose";
