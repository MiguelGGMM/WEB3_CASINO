import CommonService from './CommonService'
import { ICasinoTreasuryService } from '../ts/interfaces'
import { CasinoTreasury__factory } from '../abis'

import config from '../config'

const casinoAdr = config.NEXT_PUBLIC_CASINOADR

export const CasinoTreasuryService: ICasinoTreasuryService = {
  defaultProvider: CommonService.defaultProvider,
  address: casinoAdr,

  deposit: (provider, tokensQuantity) => {
    const signer = provider.getSigner()
    if (
      !CasinoTreasuryService.address ||
      CasinoTreasuryService.address == undefined
    ) {
      CommonService.throwErrorMissingVar('NEXT_PUBLIC_CASINOADR')
    }
    const contract = CasinoTreasury__factory.connect(
      CasinoTreasuryService.address,
      signer,
    )
    return contract.depositTokens({ value: tokensQuantity })
  },
  withdraw: (provider, tokensQuantity) => {
    const signer = provider.getSigner()
    if (
      !CasinoTreasuryService.address ||
      CasinoTreasuryService.address == undefined
    ) {
      CommonService.throwErrorMissingVar('NEXT_PUBLIC_CASINOADR')
    }
    const contract = CasinoTreasury__factory.connect(
      CasinoTreasuryService.address,
      signer,
    )
    return contract.withdrawTokens(tokensQuantity.toString())
  },
  // User own wallet
  getTokensAmount: async (provider) => {
    const signer = provider.getSigner()
    const owner = await signer.getAddress()
    const balance = await provider.getBalance(owner)
    return balance
  },
  getTokensValueDollars: async (provider) => {
    const tokensAmount = await CasinoTreasuryService.getTokensAmount(provider)
    const _value = await CommonService.getETHValue(tokensAmount.toString())
    return _value
  },
  // User casino wallet
  getTokensAmountIWallet: async (provider) => {
    const signer = provider.getSigner()
    const owner = await signer.getAddress()
    if (
      !CasinoTreasuryService.address ||
      CasinoTreasuryService.address == undefined
    ) {
      CommonService.throwErrorMissingVar('NEXT_PUBLIC_CASINOADR')
    }
    const instance = CasinoTreasury__factory.connect(
      CasinoTreasuryService.address,
      provider,
    )
    const balance = await instance.balanceOf(owner)
    return balance
  },
  getTokensValueDollarsIWallet: async (provider) => {
    const tokensAmount = await CasinoTreasuryService.getTokensAmountIWallet(
      provider,
    )
    if (
      !CasinoTreasuryService.address ||
      CasinoTreasuryService.address == undefined
    ) {
      CommonService.throwErrorMissingVar('NEXT_PUBLIC_CASINOADR')
    }
    const instance = CasinoTreasury__factory.connect(
      CasinoTreasuryService.address,
      provider,
    )
    return instance.calcDollars(tokensAmount)
  },
  throwErrorMissingVar: (varMissing) => {
    throw new Error(varMissing + ' is missing on enviroment variables')
  },
}
