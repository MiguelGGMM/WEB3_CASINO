// @ts-disable

import React, { useEffect, useState} from "react";
import { useWeb3React } from "@web3-react/core";
import { isMobile } from "react-device-detect";
import { ethers } from "ethers";
import { injected, walletconnect } from "../components/wallet/connectors";
import { getOS } from '../utils/device';

/**
 * Provides the required methods to connect/disconned your wallet and other data, depends on:
 *      ../components/wallet/connectors (required libraries for wallet connection)
 */
export const useWeb3 = (props: any) => {
    const {
        active,
        chainId,
        account,
        library,
        activate: activateWeb3,
        deactivate,
    } = useWeb3React();
    const [provider, setProvider] = useState<ethers.providers.Web3Provider>(); //
    const [signer, setSigner] = useState<any>(null);

    const connector = isMobile ? (getOS() == 'Android' ? injected : walletconnect) : injected;

    useEffect(() => {
        if (active) {
            const provider = new ethers.providers.Web3Provider(
                library.currentProvider
            );
            const signer = provider.getSigner();

            setProvider(provider);
            setSigner(signer);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const getCurrentProvider = () => {
        try {
            // @ts-ignore
            if (!window.web3) return 'unknown';
            // @ts-ignore
            if (window.web3.currentProvider.isMetaMask) return 'metamask';
            // @ts-ignore
            if (window.web3.currentProvider.isTrust) return 'trust';
            // @ts-ignore
            if (window.web3.currentProvider.isGoWallet) return 'goWallet';
            // @ts-ignore
            if (window.web3.currentProvider.isAlphaWallet) return 'alphaWallet';
            // @ts-ignore
            if (window.web3.currentProvider.isStatus) return 'status';
            // @ts-ignore
            if (window.web3.currentProvider.isToshi) return 'coinbase';
            // @ts-ignore
            if (typeof window.__CIPHER__ !== 'undefined') return 'cipher';
            // @ts-ignore
            if (window.web3.currentProvider.constructor.name === 'EthereumProvider') return 'mist';
            // @ts-ignore
            if (window.web3.currentProvider.constructor.name === 'Web3FrameProvider') return 'parity';
            // @ts-ignore
            if (window.web3.currentProvider.host && window.web3.currentProvider.host.indexOf('infura') !== -1) return 'infura';
            // @ts-ignore
            if (window.web3.currentProvider.host && window.web3.currentProvider.host.indexOf('localhost') !== -1) return 'localhost';
        } catch (err) {
            
        }

        return 'unknown';
    };

    return {
        active: active,
        account: account,
        library: library,
        provider: provider,
        signer: signer,
        chainId: chainId,
        connect: async () => {
            try {
                // @ts-ignore
                if(getCurrentProvider() == 'metamask' || getCurrentProvider() == 'trust') {
                    // @ts-ignore
                    activateWeb3(injected);
                } else {
                    activateWeb3(connector);
                }
            } catch (err: any) {
                throw err;
            }
        },
        disconnect: () => {
            deactivate();
        },
    };
};
