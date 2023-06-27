/**
 * Button to connect your wallet
 */

import React, { useEffect, useState } from "react";
import {
    // ConnectButton,
    // ConnectButtonImage,
    // Container,
    MainContainer,
} from "./styles";

//import SnackbarElement from '../../utils/SnackbarElement';// @mui/material';
import { notify } from 'react-notify-toast';
//import { useSelector, useDispatch } from "react-redux";
//import { useWeb3Modal } from "../../hooks/web3";
import { useWeb3 } from '../../hooks/useWeb3';
import Web3 from 'web3';
//import { getPrice } from "../../utils/web3helper";
import CommonService from "../../services/CommonService";

const errorText = {
    background: 'red',
    text: 'white'
}
const truncateAddress = (address) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
};

const ConnectWallet = () => {

    const {
        chainId,
        account,
        active,
        //library,
        provider,
        signer,
        connect,
        disconnect
    } = useWeb3();

    const [connected, isConnected] = useState(false);
    //const [snackbar, setSnackbar] = useState({ open: false });

    const trySwitchChain = async (provider) => {
        if(provider && provider.provider) {     
            notify.show(`You need to switch your network in order to use the dapp!`, 'custom', 3000, errorText);
            setTimeout(() => {
                provider.provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: Web3.utils.toHex(CommonService.getChainId()) }]
                }, () => {
                    // Do nothing
                });
            }, 1500);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            onConnect(false);
        }, 1200);
    }, []);

    useEffect(() => {
        if (provider && account && active && connected) {            
            CommonService.setProvider(provider);
            CommonService.setSigner(signer);
            CommonService.checkNetwork(chainId).then((isValid) => {
                if (isValid) {         
                }else{                    
                    trySwitchChain(provider);
                }
            }).catch((err) => {
                if (err && err.message && err.code == 4001) { 
                    
                }   
                notify.show(err.message, 'custom', 3000, errorText);
                trySwitchChain(provider);         
            });
        }
    }, [provider, signer, account, active, chainId, connected]);

    const onConnect = async (fromButton=true) => {
        if (active && fromButton && CommonService.checkNetworkBasic(chainId)) {    
            disconnect();
        } else {                        
            // Check network
            CommonService.checkNetwork(chainId).then((isValid) => {   
                if(isValid || !chainId) {                        
                    connect().then(() => {
                        isConnected(true);
                        if(!chainId) {
                            //trySwitchChain(provider);
                        }
                    }).catch((err) => {
                        if (err.message) {                            
                            notify.show(err.message, 'custom', 3000, errorText);
                        }
                        trySwitchChain(provider);
                    });
                } else {      
                    trySwitchChain(provider);
                }
            }).catch((err) => {
                if (err && err.message && err.code == 4001) { 
                    /** Refused transaction */ 
                    notify.show(err.message, 'custom', 3000, errorText);
                }
                trySwitchChain(provider);
            });
        }
    }

    // const { connectWallet, disconnectWallet, provider, error } = useWeb3Modal();

    // const handleClickConnect = async () => {
    //     await connectWallet();
    //     window.location.reload();
    // };

    // const handleClickAddress = () => {
    //     disconnectWallet();
    //     window.location.reload();
    // };

    return (
        <MainContainer>
            <div
                className="button"
                href="#"
                onClick={onConnect}
                // {signerAddress ? handleClickAddress : handleClickConnect}
                style={{ cursor: 'pointer', fontSize: '1em' }}>
                {active && account && CommonService.checkNetworkBasic(chainId) ? truncateAddress(account) : "CONNECT"}
            </div>       
        </MainContainer>        
    );
};

export default ConnectWallet;
