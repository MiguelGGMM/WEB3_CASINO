import React, { useState, useRef, useCallback } from "react";
//import Rodal from 'rodal'; //replaced by dialogBetResult
import ResponsiveDialog from './dialogBetResult';
import Confetti from "./confeti";
// import styles from './stylesModule.scss'
import { FormContainer, ButtonAction } from "../../styles/wheel";
import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
//import { notify } from "react-notify-toast";
import dynamic from "next/dynamic";
import { RouletteService } from "@/src/services/RouletteService";
import { CasinoTreasuryService } from "@/src/services/CasinoTreasuryService";
import { useWeb3 } from "../../hooks/useWeb3";
import RoulettePaid from "./roulettePaid";
//https://www.npmjs.com/package/react-custom-roulette#multi-spin
import { Snackbar } from '@mui/material';
import CommonService from "../../services/CommonService";
import { betType, betState, prizeType } from '../../ts/const';
import { prizeTypeText, winPrefix,  } from '../../ts/types';
import { prizeTypeKeys, customDollarPrizeSubtypeKeys } from '../../betsConfig/types';
import { ContractTransaction } from "ethers";
import { web3Error } from "@/src/ts/types";
import contractConfig from "@/src/betsConfig/contractConfig";

const OperationsBox = dynamic(() => import("./operationsBox"), {
    ssr: false
});

const loadingGif = "assets/img/spin/loading.gif";
//const refreshButton = "assets/img/spin/redo.png";

const DEFAULT_DATA_BALANCES = {
    USER_TOKENS: '0',
    USER_TOKENS_VALUE: '0',
    USER_TOKENS_IWALLET: '0',
    USER_TOKENS_VALUE_IWALLET: '0'
};

const DEFAULT_DATA_PROFITS = {
    PROFITS_LEFT_TODAY: '0',
    PROFITS_LEFT_WEEK: '0',
    PROFITS_MAX_TODAY: '0',
    PROFITS_MAX_WEEK: '0'     
};

const DEFAULT_DATA_BETS = {
    PENDING_BETS_USER: [] as Array<string>,
    PENDING_CLAIM_USER: [] as Array<string>
};

const WheelLayout = (props: any) => {  
    const [tokenBox, setTokenBox] = useState({ 
        name: 'Ethereum', 
        symbol: '$ETH', 
        depositVal: 0, 
        withdrawVal: 0 
    });

    const [modalVisible, isModalVisible] = React.useState(false);
    const [messageNode, setMessageNode] : any = React.useState(null);   
    const [backgroundColorDB, setBackgroundColorDB] = React.useState("black");
    /////////////////////////// 
    const [enabledConfirmButton, setEnabledConfirmButton] = React.useState(false);
    const [fireConfettiTrigger, setFireConfettiTrigger] = React.useState(false);
    // User data
    const { account, provider } = useWeb3(null);
    const [dataBalances, setDataBalances] = useState({...DEFAULT_DATA_BALANCES});
    const [dataProfits, setDataProfits] = useState({...DEFAULT_DATA_PROFITS});
    const [dataBets, setDataBets] = useState({...DEFAULT_DATA_BETS});
    const [dataBetPaid, setDataBetPaid] = useState<null | any>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    // DATA LOADS AN RELOADS
    let THREAD_RELOAD_USERDATA: ReturnType<typeof setInterval> | undefined = undefined;

    const onWin = (prizeText: prizeTypeKeys | customDollarPrizeSubtypeKeys, icon: any, backgroundColor: any) => {
        let pType = prizeType[prizeText as prizeTypeKeys];
        let isCustomDollarPrice = contractConfig.customDollarPriceEnabled.includes(prizeText as customDollarPrizeSubtypeKeys);

        if(isCustomDollarPrice || pType != prizeType.none){
            if(!isCustomDollarPrice && prizeText != prizeTypeText[prizeType.freeSpin]){
                var audio = new Audio('/assets/media/sounds/winner.mp3');
                audio.play();
                setFireConfettiTrigger(true);
            }
        }else{
            var audio = new Audio('/assets/media/sounds/lose.mp3');
            audio.play();
        }

        let prize: string = '';
        if(pType >= 0) {
            prize = prizeTypeText[pType];
        }        
        else {
            prize = prizeText as string;
        }    

        let titleMesage = pType != prizeType.none ? "Congratulations!" : "We are sorry!";
        let prefixBody = pType != prizeType.none ? winPrefix : "";

        // Win modal
        showModal(true, (
             <div style={{maxHeight:"120 !important"}}> 
                <h1 style={{fontSize: '3em', alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
                    { titleMesage }
                    <img src={icon} style={{ maxHeight: 50, marginLeft: 10 }} />
                </h1>
                <p style={{alignItems: 'center', justifyContent: 'center', display: 'flex', marginLeft: '3px', marginRight: "3px"}}>You { 
                `${ prefixBody }` 
                } <span style={{ fontWeight: 800, color: '#fff', marginLeft: '3px', marginRight: "3px" }}>{ 
                `${ prize }`
                }</span>Claim your bet.</p>
            </div>
        ), backgroundColor);
    }

    const showModal = (visible: any, node: any, backgroundColor: any) => {
        isModalVisible(visible);
        setMessageNode(node);
        setBackgroundColorDB(backgroundColor);
    }

    const updateRouletteVisibility = async (show: any) => { 
        let _visibilityControl = 0;
        if(show){
            _visibilityControl = 1;            
        }
        if(document.getElementById("paidBetRoulette") != null) {
            (document.getElementById("paidBetRoulette") as HTMLElement).style.display = _visibilityControl == 1 ? "flex" : "none";
        }
        if(document.getElementById("loadGifRoulettes") != null) {
            (document.getElementById("loadGifRoulettes") as HTMLElement).style.display = _visibilityControl == 0 ? "flex" : "none";      
        }  
    }

    const reloadUserDataBalances = async () => {
        if(provider){
            try 
            {
                const network = await provider.getNetwork();
                const validNetwork = await CommonService.checkNetwork(network.chainId);
                if (!validNetwork){ 
                    return;
                }

                // Balances data (recharge on load and after deposit/withdraw)
                dataBalances.USER_TOKENS = (parseFloat((await CasinoTreasuryService.getTokensAmount(provider)).toString()) / 10 ** 18).toFixed(5);
                dataBalances.USER_TOKENS_VALUE = (await CommonService.getETHValue(dataBalances.USER_TOKENS)).toString();
                dataBalances.USER_TOKENS_IWALLET = (parseFloat((await CasinoTreasuryService.getTokensAmountIWallet(provider)).toString()) / 10 ** 18).toFixed(5);
                dataBalances.USER_TOKENS_VALUE_IWALLET = (await CommonService.getETHValue(dataBalances.USER_TOKENS_IWALLET)).toString();
                setDataBalances({...dataBalances});
            } catch (err) {
                setDataBalances({...DEFAULT_DATA_BALANCES});
                setSnackbarError(err);
                console.log(err, new Error().stack);
            }
        }
    }
    const reloadUserDataProfits = async () => {
        if(provider){
            try 
            {
                const network = await provider.getNetwork();
                const validNetwork = await CommonService.checkNetwork(network.chainId);
                if (!validNetwork){ 
                    return;
                }

                // Spins data paid (recharge on load and after paid bet)
                dataProfits.PROFITS_LEFT_TODAY = Math.max(parseInt(await RouletteService.profitsMadeToday(provider)), 0).toString();
                dataProfits.PROFITS_LEFT_WEEK = Math.max(parseInt(await RouletteService.profitsMadeWeek(provider)), 0).toString();
                dataProfits.PROFITS_MAX_TODAY = (await RouletteService.profitsMaxToday(provider)).toString();
                dataProfits.PROFITS_MAX_WEEK = (await RouletteService.profitsMaxWeek(provider)).toString();
                setDataProfits({...dataProfits});
            } catch (err) {
                setDataProfits({...DEFAULT_DATA_PROFITS});
                setSnackbarError(err);
                console.log(err, new Error().stack);
            }
        }
    }

    const reloadUserDataBetsData = async () => {
        if(provider){
            try 
            {
                const network = await provider.getNetwork();
                const validNetwork = await CommonService.checkNetwork(network.chainId);
                if (!validNetwork){ 
                    return;
                }

                // Pending bets user (recharge on load and after performing any bet)
                dataBets.PENDING_BETS_USER = (await RouletteService.pendingBets(provider)).map(_a => _a.toString());//[];                
                dataBets.PENDING_CLAIM_USER = (await RouletteService.pendingClaimBets(provider)).map(_a => _a.toString());//[];
                setDataBets({...dataBets});
            } catch (err) {
                setDataBets({...DEFAULT_DATA_BETS});
                setSnackbarError(err);
                console.log(err, new Error().stack);
            }
        }
    }

    const reloadUserData = async () => {
        if(provider){
            try 
            {
                const network = await provider.getNetwork();
                const validNetwork = await CommonService.checkNetwork(network.chainId);
                if (!validNetwork){ 
                    return;
                }

                updateRouletteVisibility(false);
                await Promise.all([
                    reloadUserDataBalances(),
                    reloadUserDataProfits(),
                    reloadUserDataBetsData()
                ]);
                CommonService.refreshETHPriceCache();

                setTimeout(() => updateRouletteVisibility(true), 2000);
            } catch (err) {
                setSnackbarError(err);
                console.log(err, new Error().stack);
            }
        }
    }

    const waitAndReload = async (req: ContractTransaction, untilPendingBets = false) => {
        await req.wait();
        if(!untilPendingBets){
            forceReload();
        }else{
            forceReloadUntilPending();
        }
    }

    const setSnackbarError = async (err: web3Error | unknown) => {
        let _err : web3Error = err as any; // I do not care, because all web3Error properties are nullable        
        updateRouletteVisibility(false);                                                              
        setSnackbar({
            open: true,
            message: RouletteService.getErrorMessage(_err) ?? _err.toString(),
            type: 'error'
        });
        setTimeout(() => updateRouletteVisibility(true), 1000);
    }
 
    const setSnackbarSuccess = async (msg :string, ts=1000) => {
        updateRouletteVisibility(false);                                                              
        setSnackbar({
            open: true,
            message: msg,
            type: 'success'
        });  
        setTimeout(() => updateRouletteVisibility(true), ts);
    }

    const forceReloadUntilPending = async () => {
        if(THREAD_RELOAD_USERDATA) {
            clearInterval(THREAD_RELOAD_USERDATA);
        }
        THREAD_RELOAD_USERDATA = setInterval(async () => {
            updateRouletteVisibility(false);
            await reloadUserDataBetsData();
            if(dataBets.PENDING_CLAIM_USER.length > 0){
                setTimeout(() => updateRouletteVisibility(true), 2000);
                clearInterval(THREAD_RELOAD_USERDATA);
            }
        }, 5000);
    }

    const forceReload = async (ts=100) => {
        setTimeout(async () => { 
            reloadUserData();
        }, ts);
    }

    const betsDisabled = () => {
        return (dataBets.PENDING_CLAIM_USER && dataBets.PENDING_CLAIM_USER.length > 0);
    }

    React.useEffect(() => {
        setFireConfettiTrigger(false);
        forceReload();        
    },[provider]);

    React.useEffect(() => {
        setFireConfettiTrigger(false);
        forceReload();        
    },[account]);

    return (
        <div id="wheel-container" className="container-fluid py-4">
            <SnackbarElement
                open={snackbar.open}
                message={snackbar.message}
                autoHideDuration={5000}
                // {snackbar.autoHideDuration ? snackbar.autoHideDuration : 10000}
                onClose={() => {
                    snackbar.open = false;
                    snackbar.message = '';
                    updateRouletteVisibility(false);
                    setSnackbar({ ...snackbar });
                    setTimeout(() => updateRouletteVisibility(true), 1000);
                    // setSnackbar(snackbar);                    
                }}
                type={snackbar.type}
            />
            <div className="row mt-4 pb-4 position-relative">
                <div className="col-8-1">                    
                    <div className="border-radius-xs tw-mb-0">
                        <div className="card-body p-3 -tw-mt-7 tw-flex">
                            <div className="tw-flex tw-justify-center tw-flex-col">
                            <h6 className="font-weight-bolder tw-flex tw-text-base tw-text-[#ffffff]">
                                <img className="tw-h-5 tw-w-5 tw-mr-2 tw-align-text-top" src="../assets/img/icons/wallet.png"/>
                                <span className="tw-text-[#f7db2d] tw-pr-1">Wallet:</span> {` ${ dataBalances.USER_TOKENS } $ETH (${ dataBalances.USER_TOKENS_VALUE }$)`}
                            </h6>
                            <h6 className="font-weight-bolder tw-flex tw-text-base tw-text-[#ffffff]">
                                <img className="tw-h-5 tw-w-5 tw-mr-2 tw-align-text-top" src="../assets/img/icons/deposit.png"/>
                                <span className="tw-text-[#f7db2d] tw-pr-1">Deposit:</span> {` ${ dataBalances.USER_TOKENS_IWALLET } $ETH (${ dataBalances.USER_TOKENS_VALUE_IWALLET }$)`}
                            </h6>
                            </div>                                                       
                        </div>   
                    </div>

                    <div className="bg-gradient-primary tw-rounded-xl">
                        <div className="card-body p-3 tw-pb-0">
                            <div className="row">
                                <div className="col-lg-12">                                
                                    <button
                                    className="tw-bg-[#FFD700] tw-text-black tw-font-bold tw-rounded-lg tw-p-2"
                                    onClick={() => {
                                        forceReload();
                                    }}
                                    >{"Refresh"}</button>
 
                                    <Confetti fireConfettiTrigger={fireConfettiTrigger} />

                                    <div id="rowRoulettes" className="row">
                                        <div id="loadGifRoulettes" className="col tw-overflow-visible tw-flex-col tw-justify-center tw-items-center tw-mb-7" style={{ display: 'flex' }}>
                                            <img src={loadingGif} />
                                            <div className="tw-h-9"></div>
                                        </div>

                                        <div id="paidBetRoulette" className="col tw-overflow-visible tw-flex-col tw-justify-center tw-items-center" style={{ display: 'none' }}>
                                            <div className="tw-mt-7">
                                                <RoulettePaid 
                                                    bet={dataBetPaid}
                                                    onWin={onWin}                                                    
                                                />
                                            </div>
                                            <div className="tw-text-center">Profits Today: { dataProfits.PROFITS_LEFT_TODAY } / { dataProfits.PROFITS_MAX_TODAY }</div>
                                            <div className="tw-text-center tw-mb-0">Profits Weekly: { dataProfits.PROFITS_LEFT_WEEK } / { dataProfits.PROFITS_MAX_WEEK }</div>
                                            <div className="tw-inline-flex tw-flex-row tw-justify-center tw-items-center">
                                                {contractConfig && contractConfig.betsEnabled.map(betA => {
                                                    return (
                                                        <button 
                                                        key={betA}
                                                        disabled={betsDisabled()}
                                                        className="tw-bg-[#FFD700] tw-text-black tw-mt-5 tw-font-bold tw-rounded-lg tw-p-2 tw-mr-2 tw-cursor-pointer"
                                                        onClick={() => {
                                                            if(provider) {
                                                                RouletteService.performPaidBet(betA, provider).then((ans) => {
                                                                    waitAndReload(ans, true);
                                                                    setSnackbarSuccess( `Paid ${betA}$ Bet Performed Successfully, Good Luck!`);                                              
                                                                }).catch((err) => {
                                                                    setSnackbarError(err);
                                                                });
                                                            }
                                                        }}>
                                                        {`BET ${betA}$`}</button>)
                                                })}                                  
                                            </div>                                                                                    
                                        </div>                                        
                                    </div>   

                                    <div className="row">
                                        <div className="col tw-overflow-visible tw-flex tw-justify-center tw-items-center">
                                            <ResponsiveDialog visible={modalVisible} content={messageNode} title={''} fatherId={"wheel-container"} 
                                            dialogStyle={{ '& .MuiPaper-root': {background: backgroundColorDB}, boxShadow: 'none'}}/>
                                        </div>
                                    </div>

                                    <div className="row tw-mt-3">
                                        <div className="col tw-overflow-hidden tw-flex tw-justify-center tw-items-center">
                                            { (dataBets.PENDING_CLAIM_USER && dataBets.PENDING_CLAIM_USER.length > 0) &&
                                                <button 
                                                className="tw-cursor-pointer tw-bg-[#FFD700] tw-text-[black] tw-font-bold tw-rounded-lg tw-p-2 tw-pl-2 tw-pr-2 tw-mr-2"
                                                id="spinButton"
                                                onClick={() => {
                                                    if(provider && dataBets.PENDING_CLAIM_USER.length >= 1) {
                                                        let betClaim = dataBets.PENDING_CLAIM_USER[0];
                                                        RouletteService.getBetData(provider, betClaim).then(betData => {
                                                            if(betData.state == betState.solved){
                                                                if(betData._type == betType.paid){
                                                                    updateRouletteVisibility(false);
                                                                    setDataBetPaid(betData); 
                                                                    setEnabledConfirmButton(true);
                                                                    if(document.getElementById("spinButton") != null) {       
                                                                        (document.getElementById("spinButton") as HTMLButtonElement).disabled=true;
                                                                        (document.getElementById("spinButton") as HTMLButtonElement).title="Already spinned";
                                                                    }
                                                                    setTimeout(() => updateRouletteVisibility(true), 1000);
                                                                    var audio = new Audio('/assets/media/sounds/roulette.mp3');
                                                                    setTimeout(() => {audio.play()}, 2000);               
                                                                }
                                                            }
                                                        });
                                                    }
                                                }}
                                                >{"SPIN"}</button>
                                            }
                                            { (dataBets.PENDING_CLAIM_USER && dataBets.PENDING_CLAIM_USER.length > 0) &&
                                                <button 
                                                className="tw-cursor-pointer tw-bg-[#FFD700] tw-text-[black] tw-font-bold tw-rounded-lg tw-p-2 tw-pl-2 tw-pr-2 tw-mr-2"
                                                disabled={!enabledConfirmButton}
                                                onClick={() => {
                                                    if(provider && dataBets.PENDING_CLAIM_USER.length >= 1) {
                                                        let betClaim = dataBets.PENDING_CLAIM_USER[0];
                                                        RouletteService.claimBet(betClaim, provider).then((ans) => {
                                                            updateRouletteVisibility(false);
                                                            isModalVisible(false);
                                                            setMessageNode('');                                                   
                                                            setEnabledConfirmButton(false);                                                    
                                                            RouletteService.getPrizeFromBetIndex(provider, betClaim).then((_ans) => {
                                                                waitAndReload(ans);
                                                                setSnackbarSuccess(`You Bet with id ${betClaim} was Claimed, you ${_ans}`, 2000);                                                  
                                                            });                            
                                                            (document.getElementById("spinButton") as HTMLButtonElement).disabled=false;                        
                                                            (document.getElementById("spinButton") as HTMLButtonElement).title=''; 
                                                            setTimeout(() => updateRouletteVisibility(true), 1000);
                                                        }).catch((err) => {
                                                            setSnackbarError(err);
                                                        });
                                                    }
                                                }}
                                                >{"CONFIRM"}</button>
                                            }
                                            { (dataBets.PENDING_BETS_USER && dataBets.PENDING_BETS_USER.length > 0) &&
                                                <button 
                                                className="tw-cursor-pointer tw-bg-[#FFD700] tw-text-[black] tw-font-bold tw-rounded-lg tw-p-2 tw-pl-2 tw-pr-2 tw-mr-2"
                                                onClick={() => {
                                                    if(provider && dataBets.PENDING_BETS_USER.length >= 1) {
                                                        let betCancel = dataBets.PENDING_BETS_USER[0];
                                                        RouletteService.cancelBet(betCancel, provider).then((ans) => {
                                                            waitAndReload(ans);
                                                            setSnackbarSuccess(`You Bet with id ${betCancel} was Cancelled, if it was a paid bet your money was returned`);                                                  
                                                        }).catch((err) => {
                                                            setSnackbarError(err);
                                                        });
                                                    }
                                                }}
                                                >{"CANCEL BET"}</button>
                                            }
                                        </div>
                                    </div>                                     

                                    <div className="d-flex flex-column tw-relative tw-overflow-visible">                                 
                                        <FormContainer className="tw-pl-0 tw-pr-0">
                                        <div className="row tw-justify-center tw-pt-0">
                                            <div className="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                                                <div className=" tw-flex tw-justify-center tw-items-center tw-flex-col tw-mt-2 tw-w-full tw-m-0">
                                                    <OperationsBox
                                                        index={0}
                                                        token={tokenBox}
                                                        getETHValue={CommonService.getETHValue}
                                                        operation={'Deposit'}
                                                        allowDecimals={true}
                                                        min={1}
                                                        step={0.001}
                                                        // disableLoading={true}
                                                        disabledInputs={false}
                                                        onGotPath={({
                                                            val
                                                        }: any) => {
                                                            tokenBox.depositVal = val.value;
                                                        }}
                                                    />
                                                    <ButtonAction
                                                        onClick={() => {
                                                            if(provider) {
                                                                try{
                                                                    CasinoTreasuryService.deposit(provider, Math.floor(tokenBox.depositVal * (10 ** 18)).toString()).then((ans) => {
                                                                        waitAndReload(ans);
                                                                    }).catch((err) => {
                                                                        setSnackbarError(err);
                                                                    });
                                                                }catch(err){
                                                                    setSnackbarError(err);
                                                                }
                                                            }
                                                        }}
                                                        className="tw-opacity-100 tw-mt-1 tw-pointer-events-auto">
                                                        DEPOSIT
                                                    </ButtonAction>     
                                                </div>                                           
                                            </div>   

                                            <div className="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                                                <div className=" tw-flex tw-justify-center tw-items-center tw-flex-col tw-mt-2 tw-w-full tw-m-0">
                                                    <OperationsBox
                                                        index={1}
                                                        token={tokenBox}
                                                        getETHValue={CommonService.getETHValue}
                                                        operation={'Withdraw'}
                                                        allowDecimals={true}
                                                        min={1}
                                                        step={0.001}
                                                        // disableLoading={true}
                                                        disabledInputs={false}
                                                        onGotPath={({
                                                            val
                                                        }: any) => {
                                                            tokenBox.withdrawVal = val.value;
                                                        }}
                                                    />
                                                    <ButtonAction
                                                        onClick={() => {
                                                            if(provider) {
                                                                CasinoTreasuryService.withdraw(provider, Math.floor(tokenBox.withdrawVal * (10 ** 18)).toString()).then((ans) => {
                                                                    waitAndReload(ans);
                                                                }).catch((err) => {  
                                                                    setSnackbarError(err);
                                                                });
                                                            }
                                                        }}
                                                        className="tw-opacity-100 tw-mt-1 tw-pointer-events-auto">
                                                        WITHDRAW
                                                    </ButtonAction>     
                                                </div>                                           
                                            </div>                 
                                        </div>                                                                                           
                                        </FormContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SnackbarElement = (props: any) => {
    const {
        onClose
    } = props;

    return (
        <Snackbar
            {...props}
            ContentProps={{
                style:  { 
                    backgroundColor: props.type == 'success' ? "green" : (props.type == 'error' ? "red" : (props.type == 'warning' ? "yellow" : "black")) 
                } 
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
            }}
            action={
                <button
                    onClick={onClose}
                    className={[(useStyles as _useStyles).snackbar_action_button].join(" ")}>
                    Close
                </button>
            }
        />
    )
}

type _useStyles = {
    snackbar_action_button: any
}
const useStyles: unknown = makeStyles((theme) => ({
    snackbar_action_button: {
        // @extend .button;
        // @include mainFont();
        color: '#57cc75 !important',
        background: '#1f943d !important',
        textShadow: 'none !important',
        fontSize: '0.5em !important'
    }
}));

export default WheelLayout;