import { ethers } from 'ethers'
import { useWeb3Modal } from '@web3modal/react'
import { useAccount, useDisconnect, useSwitchNetwork } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

/**
 * Provides the required methods to connect/disconned your wallet and other data
 */
export const useWeb3 = () => {
  const { open } = useWeb3Modal()
  const { isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchNetwork, chains, pendingChainId, switchNetworkAsync } =
    useSwitchNetwork({ chainId: arbitrum.id })

  return {
    getAddress: connector
      ? async () => {
          if (!connector) return null
          const _adr = await connector.getAccount()
          return _adr
        }
      : null,
    getProvider: connector
      ? async () => {
          if (!connector) return null
          const _prv = await connector.getProvider()
          return new ethers.providers.Web3Provider(_prv)
        }
      : null,
    getSigner: connector
      ? async () => {
          if (!connector) return null
          const _prv = await connector.getProvider()
          return new ethers.providers.Web3Provider(_prv).getSigner()
        }
      : null,
    getChainId: connector
      ? async () => {
          if (!connector) return null
          const _chainId = await connector.getChainId()
          return _chainId
        }
      : null,
    open: open,
    isConnected: isConnected,
    connector: connector,
    disconnect: disconnect,
    switchNetwork: switchNetwork,
    switchNetworkAsync: switchNetworkAsync,
    pendingChainId: pendingChainId,
    chains: chains,
  }
}
