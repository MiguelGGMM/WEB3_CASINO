/**
 * Allows to define some logic once the user connects/disconnects, also automatically connect
 * connect if the provider is cashed but has not yet been set (e.g. page refresh)
 */

import { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
//import WalletLink from "walletlink";
import config from "../config";

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: { },
            network: "mainnet",
        },
    },
};
providerOptions.walletconnect.rpc[config.NEXT_PUBLIC_CHAIN_ID] = config.NEXT_PUBLIC_DEFAULT_NODE;

export function useWeb3Modal() {
    const [provider, setProvider] = useState(undefined);
    const [error, setError] = useState(null);

    const web3Modal = new Web3Modal({
        providerOptions, // required
        cacheProvider: true,
    });

    if (web3Modal.cachedProvider && !provider) {
        connectWallet();
    }

    async function connectWallet() {
        try {
            const externalProvider = await web3Modal.connect();
            const ethersProvider = new ethers.providers.Web3Provider(
                externalProvider
            );

            setProvider(ethersProvider);
            // window.location.reload();
        } catch (e) {
            setError("NO_WALLET_CONNECTED");
            console.log("NO_WALLET_CONNECTED", e);
        }
    }

    function disconnectWallet() {
        web3Modal.clearCachedProvider();
        setProvider(undefined);
    }

    return { connectWallet, disconnectWallet, provider, error };
}
