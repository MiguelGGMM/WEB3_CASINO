/**
 * Required libraries for wallet connection
 */

import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import config from '@/src/config';

const RPC_BSC = config.NEXT_PUBLIC_DEFAULT_NODE;
const CHAIN_ID = config.NEXT_PUBLIC_CHAIN_ID;
//const POLLING_INTERVAL = 12000

// If I use this then I cannot connect with wallet
// extension in order to require network change etc
const CHAIN_IDS_SUPPORTED = null;//[ CHAIN_ID ];
const wConnectorObj = {
    chainId: CHAIN_ID,
    rpc: {  },
    // bridge: '',
    qrcode: true,
    infuraId: null,
    rpcUrl: RPC_BSC
    // pollingInterval: POLLING_INTERVAL
}
wConnectorObj.rpc[CHAIN_ID] = RPC_BSC;
const nConnectorObj = {
    urls: {  },
    defaultChainId: CHAIN_ID,
    supportedChainIds: CHAIN_IDS_SUPPORTED,
}
nConnectorObj.urls[CHAIN_ID] = RPC_BSC

export const injected = new InjectedConnector({ supportedChainIds: CHAIN_IDS_SUPPORTED });
export const walletconnect = new WalletConnectConnector(wConnectorObj);
export const network = new NetworkConnector(nConnectorObj);