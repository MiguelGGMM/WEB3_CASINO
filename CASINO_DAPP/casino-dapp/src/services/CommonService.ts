import axios from 'axios'
import { ethers } from 'ethers'
import { ICommonService } from '../ts/interfaces'
import config from '../config'

const toWei = (value: string) => {
  return ethers.utils.parseEther(value)
}
const fromWei = (value: ethers.BigNumberish) => {
  return ethers.utils.formatEther(value)
}

const defaultProviderUrl = config.NEXT_PUBLIC_DEFAULT_NODE
const defaultProvider = new ethers.providers.JsonRpcProvider(defaultProviderUrl)

const CommonService: ICommonService = {
  defaultProvider: defaultProvider,

  provider: defaultProvider,
  signer: null,
  ethPriceCache: 0,

  getETHValue: async (ethAmount) => {
    const ethPrice = await CommonService.getETHPrice()
    return parseInt((ethPrice * parseFloat(ethAmount)).toString())
  },
  setProvider: (provider) => {
    CommonService.provider = provider
  },
  setSigner: (signer) => {
    CommonService.signer = signer
  },
  getETHPrice: async () => {
    try {
      if (CommonService.ethPriceCache == 0) {
        const data = await axios.get(
          'https://api.coinbase.com/v2/prices/ETH-USD/spot',
        )
        if (data.data && data.data.data && data.data.data.amount) {
          CommonService.ethPriceCache = parseInt(data.data.data.amount)
        }
      }
      return CommonService.ethPriceCache
    } catch {
      return CommonService.ethPriceCache
    }
  },
  refreshETHPriceCache: () => {
    CommonService.ethPriceCache = 0
  },
  getChainId: () => config.NEXT_PUBLIC_CHAIN_ID,
  checkNetwork: (chainId) => {
    // ToDo. This does not work on mobile
    return new Promise((resolve /* reject */) => {
      resolve(CommonService.checkNetworkBasic(chainId))
    })
  },
  checkNetworkBasic: (chainId) => {
    return chainId == CommonService.getChainId()
  },
  throwErrorMissingVar: (varMissing) => {
    throw new Error(varMissing + ' is missing on enviroment variables')
  },

  toWei: toWei,
  fromWei: fromWei,
}

export default CommonService
