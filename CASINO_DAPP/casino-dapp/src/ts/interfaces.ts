import { BigNumber, BigNumberish, ethers, providers } from 'ethers'
import { web3Error } from './types'

export interface ICasinoTreasuryService {
  defaultProvider: ethers.providers.JsonRpcProvider
  address: string | undefined

  deposit(
    provider: ethers.providers.JsonRpcProvider,
    tokensQuantity: BigNumberish,
  ): Promise<ethers.ContractTransaction>
  withdraw(
    provider: ethers.providers.JsonRpcProvider,
    tokensQuantity: BigNumberish,
  ): Promise<ethers.ContractTransaction>
  getTokensAmount(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumber>
  getTokensValueDollars(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<number>
  getTokensAmountIWallet(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  getTokensValueDollarsIWallet(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  throwErrorMissingVar(varMissing: string): never
}

export interface IRouletteService {
  defaultProvider: ethers.providers.JsonRpcProvider
  addressR: string | undefined
  addressSM: string | undefined
  addressPM: string | undefined
  addressBM: string | undefined

  // SPINS MANAGER
  getUserDailyPaidSpins(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  getUserDailyPaidSpinsLeft(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  getUserDailyPaidSpinsPerformed(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  // PROFITS MANAGER
  profitsMadeToday(provider: ethers.providers.JsonRpcProvider): Promise<string>
  profitsMadeWeek(provider: ethers.providers.JsonRpcProvider): Promise<string>
  amountLeftForDailyMaxProfit(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  amountLeftForWeeklyMaxProfit(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumberish>
  profitsMaxToday(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumber>
  profitsMaxWeek(provider: ethers.providers.JsonRpcProvider): Promise<BigNumber>
  // BETS MANAGER
  pendingBetsAllPaid(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumber[]>
  pendingBets(provider: ethers.providers.JsonRpcProvider): Promise<BigNumber[]>
  pendingClaimBets(
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<BigNumber[]>
  performPaidBet(
    amount: string,
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<ethers.ContractTransaction>
  claimBet(
    betIndex: string,
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<ethers.ContractTransaction>
  cancelBet(
    betIndex: string,
    provider: ethers.providers.JsonRpcProvider,
  ): Promise<ethers.ContractTransaction>
  getBetData(
    provider: ethers.providers.JsonRpcProvider,
    betIndex: string,
  ): Promise<
    [BigNumber, string, BigNumber, number, number, number, number, number] & {
      index: BigNumber
      user: string
      betAmount: BigNumber
      _type: number
      state: number
      prizeWon: number
      customPrizeDollarAmountWonType: number
      NFTwonType: number
    }
  >
  // Others
  getPrizeFromBetIndex(
    provider: ethers.providers.JsonRpcProvider,
    betIndex: string,
  ): Promise<string>
  getErrorMessage(_error: web3Error): string | undefined
}

export interface ICommonService {
  defaultProvider: providers.JsonRpcProvider
  /**
   * Alternative, use getTokenPrice and getTokenDecimals from treasury contract,
   * that price comes from chainlink datafeeds
   * @param ethAmount
   */
  getETHValue(ethAmount: string): Promise<number>
  provider: providers.JsonRpcProvider
  signer: null | providers.JsonRpcSigner
  setProvider(provider: providers.JsonRpcProvider): void
  setSigner(signer: providers.JsonRpcSigner): void
  ethPriceCache: number
  refreshETHPriceCache(): void
  getETHPrice(): Promise<number>
  getChainId(): number
  checkNetwork(chainId: string | number): Promise<boolean>
  checkNetworkBasic(chainId: string | number): boolean
  throwErrorMissingVar(varMissing: string): never
  toWei(value: string): BigNumberish
  fromWei(value: BigNumberish): string
}
