import CommonService from './CommonService';
import { prizeType, prizeTypeOptions } from '../ts/const';
import { prizeTypeText, winPrefix, losePrefix } from '../ts/types';
import { IRouletteService } from '../ts/interfaces';
import { Roulette__factory } from '../abis';
import { SpinsManager__factory } from '../abis';
import { ProfitsManager__factory } from '../abis';
import { BetsManager__factory } from '../abis';
import debug from '../betsConfig/debug/debug.json';
import config from '../config';
import { BigNumber } from 'ethers';

const rouletteAdr = config.NEXT_PUBLIC_ROULETTEADR;
const smAdr = config.NEXT_PUBLIC_SMADR;
const profitsAdr = config.NEXT_PUBLIC_PROFITSADR;
const betsAdr = config.NEXT_PUBLIC_BETSADR;

//const debugConfig = debug.enabled ? debug.config : undefined;
const debugBetPending = debug.enabled && debug.config.pendingBet.enabled ? debug.config.pendingBet : undefined;
const debugBetPendingClaim = debug.enabled && debug.config.pendingBetClaim.enabled ? debug.config.pendingBetClaim : undefined;
const betFromDebug = (debugBet: any): [BigNumber, string, BigNumber, number, number, number, number, number] & {
    index: BigNumber;
    user: string;
    betAmount: BigNumber;
    _type: number;
    state: number;
    prizeWon: number;
    customPrizeDollarAmountWonType: number;
    NFTwonType: number;
  } => {
    return {
        index: BigNumber.from(debugBet.index),
        user: debugBet.user,
        betAmount: BigNumber.from(debugBet.betAmount),
        _type: debugBet._type,
        state: debugBet.state,
        prizeWon: debugBet.prizeWon,
        customPrizeDollarAmountWonType: debugBet.customPrizeDollarAmountWonType,
        NFTwonType: debugBet.NFTwonType
    } as [BigNumber, string, BigNumber, number, number, number, number, number] & {
        index: BigNumber;
        user: string;
        betAmount: BigNumber;
        _type: number;
        state: number;
        prizeWon: number;
        customPrizeDollarAmountWonType: number;
        NFTwonType: number;
      }
}

export const RouletteService: IRouletteService = {
    defaultProvider: CommonService.defaultProvider,
    addressR: rouletteAdr,
    addressSM: smAdr,
    addressPM: profitsAdr,
    addressBM: betsAdr,

    // SPINS MANAGER
    // Daily paid spins
    getUserDailyPaidSpins: async (provider) => {        
        if(!RouletteService.addressSM || RouletteService.addressSM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_SMADR");
        } else {
            const instance = SpinsManager__factory.connect(RouletteService.addressSM, provider);
            const dailySpins = await instance.maxDailySpins();
            return dailySpins;
        }
    },
    // Paid spins left
    getUserDailyPaidSpinsLeft: async (provider) => {        
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        if(!RouletteService.addressSM || RouletteService.addressSM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_SMADR");
        } else {
            const instance = SpinsManager__factory.connect(RouletteService.addressSM, provider);
            const dailySpins = await instance.getUserDailySpinsLeft(owner);
            return dailySpins;
        }
    },
    // Paid spins performed today
    getUserDailyPaidSpinsPerformed: async (provider) => {
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        if(!RouletteService.addressSM || RouletteService.addressSM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_SMADR");
        } else {
            const instance = SpinsManager__factory.connect(RouletteService.addressSM, provider);
            const spinsToday = await instance.getUserDailySpinsPerformed(owner);
            return spinsToday;
        }
    },
    //////////////////

    // PROFITS MANAGER
    profitsMadeToday: async (provider) => {
        return (await RouletteService.profitsMaxToday(provider)).sub(await RouletteService.amountLeftForDailyMaxProfit(provider)).toString();
    },
    profitsMadeWeek: async (provider) => {
        return (await RouletteService.profitsMaxWeek(provider)).sub(await RouletteService.amountLeftForWeeklyMaxProfit(provider)).toString();
    },
    amountLeftForDailyMaxProfit: async (provider) => {
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        if(!RouletteService.addressPM || RouletteService.addressPM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_PROFITSADR");
        } else {
            const instance = ProfitsManager__factory.connect(RouletteService.addressPM, provider);
            const _a = await instance.amountLeftForDailyMaxProfit(owner);
            return _a;
        }
    },
    amountLeftForWeeklyMaxProfit: async (provider) => {
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        if(!RouletteService.addressPM || RouletteService.addressPM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_PROFITSADR");
        } else {
            const instance = ProfitsManager__factory.connect(RouletteService.addressPM, provider);
            const _a = await instance.amountLeftForWeeklyMaxProfit(owner);
            return _a;
        }
    },
    profitsMaxToday: async (provider) => {
        if(!RouletteService.addressPM || RouletteService.addressPM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_PROFITSADR");
        } else {
            const instance = ProfitsManager__factory.connect(RouletteService.addressPM, provider);
            const _a = await instance.maxDailyProfit();
            return _a;
        }
    },
    profitsMaxWeek: async (provider) => {
        const signer = provider.getSigner();
        if(!RouletteService.addressPM || RouletteService.addressPM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_PROFITSADR");
        } else {
            const instance = ProfitsManager__factory.connect(RouletteService.addressPM, provider);
            const _a = await instance.maxWeeklyProfit();
            return _a;
        }
    },
    //////////////////

    // BETS DATA
    pendingBetsAllPaid: async (provider) => {
        if(!RouletteService.addressBM || RouletteService.addressBM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_BETSADR");
        } else {
            //Debug//
            if(debugBetPending) {
                return new Promise<BigNumber[]>((resolve, reject) => {
                    return [debugBetPending.index];
                });                
            }
            ////////
            const instance = BetsManager__factory.connect(RouletteService.addressBM, provider);
            const _a = await instance.getBetsPendingSolve(50);
            return _a;   
        }     
    },
    pendingBets: async (provider) => {
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        if(!RouletteService.addressBM || RouletteService.addressBM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_BETSADR");
        } else {
            //Debug//
            if(debugBetPending) {   
                return [BigNumber.from(debugBetPending.index)];             
            }
            ////////
            const instance = BetsManager__factory.connect(RouletteService.addressBM, provider);
            const _a = await instance.getUserPendingBets(owner);
            return _a;
        }
    },
    pendingClaimBets: async (provider) => {
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        if(!RouletteService.addressBM || RouletteService.addressBM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_BETSADR");
        } else {
            //Debug//
            if(debugBetPendingClaim) {
                return [BigNumber.from(debugBetPendingClaim.index)];
            }
            ////////
            const instance = BetsManager__factory.connect(RouletteService.addressBM, provider);
            const _a = await instance.getUserPendingBetsClaim(owner);
            return _a;
        }
    },
    getBetData: async (provider, betIndex) => {
        if(!RouletteService.addressBM || RouletteService.addressBM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_BETSADR");
        } else {
            //Debug//
            if(debugBetPendingClaim || debugBetPending) {
                if(debugBetPendingClaim && debugBetPendingClaim.index == betIndex){
                    return betFromDebug(debugBetPendingClaim);
                }
                if(debugBetPending && debugBetPending.index == betIndex){
                    return betFromDebug(debugBetPending);
                }
            }
            /////////
            const instance = BetsManager__factory.connect(RouletteService.addressBM, provider);
            const _a = await instance.bets(betIndex);
            return _a; 
        }
    },
    getPrizeFromBetIndex: async (provider, betIndex) => {
        if(!RouletteService.addressBM || RouletteService.addressBM == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_BETSADR");
        } else { 
            const instance = BetsManager__factory.connect(RouletteService.addressBM, provider);
            
            //Debug//////
            let _bet : {
                index: BigNumber;
                user: string;
                betAmount: BigNumber;
                _type: number;
                state: number;
                prizeWon: number;
                customPrizeDollarAmountWonType: number;
                NFTwonType: number;
            } | undefined = undefined;         
            if(debugBetPendingClaim && debugBetPendingClaim.index == betIndex) {
                _bet = betFromDebug(debugBetPendingClaim);
            /////////////
            } else {
                _bet = await instance.bets(betIndex);
            }

            if(_bet) {
                const _prizeType: prizeTypeOptions = _bet.prizeWon as any;            

                let result = `${_prizeType == prizeType.none ? losePrefix : winPrefix} ${prizeTypeText[_prizeType]}`;
                if(_prizeType == prizeType.customPrizeDollarAmount && _bet.customPrizeDollarAmountWonType > 0){
                    const prizeSubtype = _bet.customPrizeDollarAmountWonType;
                    let amountDollars = await instance.customDollarPrizes(prizeSubtype);
                    result =`${result} ${amountDollars}$`;
                }
                if(_prizeType == prizeType.NFT && _bet.NFTwonType > 0){
                    const prizeSubtype = _bet.NFTwonType;
                    let nftAddress = await instance.customNFTPrizes(prizeSubtype);
                    result =`${result} ${nftAddress}`;
                }
                return result;
            } else {
                return `${losePrefix} ${prizeTypeText[prizeType.none]}`;
            }
        }
    },
    /////////////

    // SIGNATURES
    // Perform paid bet
    performPaidBet: async (amount, provider) => {
        const signer = provider.getSigner();
        if(!RouletteService.addressR || RouletteService.addressR == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_ROULETTEADR");
        } else {
            const instance = Roulette__factory.connect(RouletteService.addressR, signer);
            return instance.performBet(amount);
        }
    },
    // Claim bet
    claimBet: async (betIndex, provider) => {
        const signer = provider.getSigner();
        if(!RouletteService.addressR || RouletteService.addressR == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_ROULETTEADR");
        } else {
            if(debugBetPendingClaim) {
                
            }
            const instance = Roulette__factory.connect(RouletteService.addressR, signer);
            return instance.claimBet(betIndex);
        }
    },
    // Cancel bet
    cancelBet: async (betIndex, provider) => {
        const signer = provider.getSigner();
        if(!RouletteService.addressR || RouletteService.addressR == undefined) {
            CommonService.throwErrorMissingVar("NEXT_PUBLIC_ROULETTEADR");
        } else {
            if(debugBetPending) {
                // ?
            }
            const instance = Roulette__factory.connect(RouletteService.addressR, signer);
            return instance.cancelBet(betIndex);
        }
    },
    ////////////

    // ERROR MESSAGES
    getErrorMessage: (_error) => {
        if(_error.reason){
            return _error.reason;
        }

        let message = _error?.message;
        if(_error.data && _error.data.message) {
            message = _error.data.message;
        }

        if(message != undefined) {
            message = message
                .replace(/execution reverted/gi, '')
                .replace(':', '')
                .trim();
        }

        return message;
    }
    /////////////////
}