const BN = require("bn.js");
const _ = require("lodash");

const roulette = artifacts.require("Roulette");
const betsManager = artifacts.require("BetsManager");
const profitsManager = artifacts.require("ProfitsManager");
const spinsManager = artifacts.require("SpinsManager");
const casinoTreasury = artifacts.require("CasinoTreasury");

const LINK_TOKEN = artifacts.require("LinkTokenInterface");
const CHAINLINK_VRFCOORD = artifacts.require("VRFCoordinatorV2Interface");

const defaultGwei = new BN(100000000);
const defaultGweiTestnet = new BN(10000000000);
const debug = true;

const multiTest = true;
const nAcountsPerType = 10;

//const moment = require('moment');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

/*
*   Util functions
*/
const getGasAmount = async (txHash) => {
    const tx = await web3.eth.getTransaction(txHash);
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    const gasPrice = tx.gasPrice;
    const gasUsed = receipt.gasUsed;

    return web3.utils.fromWei(gasPrice, 'ether') * gasUsed;
}

const getContractBalance = async (contract) => {
    const balance = await contract.getBalance();
    return web3.utils.fromWei(balance, 'ether');
}

const getAccountBalance = async (account) => {
    let balance = await web3.eth.getBalance(account);
    return web3.utils.fromWei(balance, 'ether');
}

const toWei = (value) => web3.utils.toWei(value.toString());
const fromWei = (value, fixed=2) => parseFloat(web3.utils.fromWei(value)).toFixed(fixed);

const increaseDays = async (days) => {
    await increase(86400 * parseInt(days));
}

const increase = async (duration) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [duration],
            id: new Date().getTime()
        }, (err, result) => {
            // second call within the callback
            web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_mine',
                params: [],
                id: new Date().getTime()
            }, (err, result) => {
                // need to resolve the Promise in the second callback
                resolve();
            });
        });
    });
}

const log = (message) => {
    if(debug){
        console.log(`[DEBUG] ${message}`);
    }
}

const simulateSpin = async (ctrBM, randomAcc) => {
    log(`simulateSpin [->]`);
    let rdnObj = Math.random() * 10000;
    let _x = 0;
    let answer = await ctrBM._simulateSpin(Math.ceil(rdnObj));
    let prizeType =  answer[0];
    let prizeSubtype = answer[1];
    let result = "'lose'";
    if(prizeType == 1) {
        result = "'x2 Reward'";
        _x = 2;
    }
    if(prizeType == 2) {
        result = "'x5 Reward'";
        _x = 5;
    }
    if(prizeType == 3) {
        result = "'x10 Reward'";
        _x = 10;
    }
    if(prizeType == 4) {
        result = "'Free Spin'";
        _x = 1;
    }
    if(prizeType == 5) {
        let amountDollars = await ctrBM.customDollarPrizes(prizeSubtype);
        result = `${amountDollars}$`;
    }
    log(`Spin result ${prizeType != 0 ? "!WON " : ""}${result} for ${randomAcc}`);
    log(`simulateSpin [<-]`);
    return [answer, _x];
}

contract("Roulette", function (accounts) {

    /*
    *   Roulette tests
    */

    var ctrAPK = null;
    var ctrBM = null;
    var ctrPM = null;
    var ctrSM = null;
    var ctrCT = null;
    var ctrLINK = null;
    var ctrVRFC = null;

    //var main_account = accounts[0];

    it("Should fail if a contract is not deployed", async function(){

        try {

            ctrAPK = await roulette.deployed();
            ctrBM = await betsManager.at((await ctrAPK.getBetManagerAdr()));
            ctrPM = await profitsManager.at((await ctrAPK.getProfitsManagerAdr()));
            ctrSM = await spinsManager.at((await ctrAPK.getSpinsManagerAdr()));
            ctrCT = await casinoTreasury.at((await ctrAPK.getCasinoTreasuryAdr()));
            ctrLINK = await LINK_TOKEN.at(process.env.CHAINLINK_TOKEN);
            ctrVRFC = await CHAINLINK_VRFCOORD.at(process.env.CHAINLINK_VRFCOORD);

            log(`Contracts deployed: Roulette, Casino treasury, Bet manager, Profits manager, Spins Manager, LINK, VRFCOORD`);
            log(`Addresses: ${ctrAPK.address}, ${ctrCT.address}, ${ctrBM.address}, ${ctrPM.address} ${ctrSM.address}, ${ctrLINK.address}, ${ctrVRFC.address}`);

            return assert.isTrue(true);
        } catch (err) {
            console.log(err.toString());
            return assert.isTrue(false);
        }
    });

    it('Set the basic config', async function(){
        // function setPrizeChanceOptions(
        //     bool paidOption, 
        //     uint8 [] memory _prizeType, 
        //     uint8 [] memory _prizeSubtype, 
        //     uint8 [] memory _bonusPer100DollarsHold, 
        //     uint256 [] memory _chanceBase10000) public onlyOwner

        // Prizes config
        await ctrAPK.setMaxDailySpins(300);
        await ctrAPK.setCustomDollarPrize(1, 5);
        await ctrAPK.setCustomDollarPrize(2, 10);
        await ctrAPK.setCustomDollarPrize(3, 15);
        await ctrAPK.setCustomDollarPrize(4, 1);
        await ctrAPK.setCustomDollarPrize(5, 2);
        //await ctrAPK.setCustomNFTPrize(2, NFTadr); // NOT IN ALFA

        // Bet amounts config
        await ctrAPK.enableDisableBetAmount(10, true);
        await ctrAPK.enableDisableBetAmount(25, true);
        // await ctrAPK.enableDisableBetAmount(50, true);

        // Whitelist contracts
        await ctrCT.whitelistCasinoContract(ctrAPK.address, true);
    });

    it('Set the bets config', async function(){
        // enum prizeType {
        //     none,
        //     x2reward,
        //     x5reward,
        //     x10reward,
        //     freeSpin,               // the tokens you used to bet will be returned to you
        //     customPrizeDollarAmount,
        //     NFT,
        // }
        //bool paidOption, uint8 [] memory _prizeType, uint8 [] memory _prizeSubtype, uint8 [] memory _bonusPer100DollarsHold, uint256 [] memory _chanceBase10000

        //chance of last element (lose) does not matter
        await ctrAPK.setPrizeChanceOptions([1, 2, 3, 4, 5, 5, 0], [0, 0, 0, 0, 4, 5, 0], [1200, 600, 200, 2000, 1300, 700, 4000]);
    });

    it('Open the roulette', async function(){
        log(`Roulette opened: ${(await ctrCT.casinoOpen())}`);
        await ctrCT.OpenCasino(true);
        log(`Roulette opened: ${(await ctrCT.casinoOpen())}`);
    });
    
    it("One day wait...", async function(){
        await increaseDays(1);
    });

    it('Deposit ETH', async function(){
        let accountsTest = accounts.slice(4, 10);
        for(const randomAcc of accountsTest){
            let nTokens = (await ctrCT.balanceOf(randomAcc)).toString();
            log(`Token bal. of ${randomAcc}: deposit bal. ${nTokens}, deposit bal.$ ${(await ctrCT.calcDollars(nTokens))}`);
            await ctrCT.depositTokens({ from: randomAcc, value: toWei("0.6") });
            nTokens = (await ctrCT.balanceOf(randomAcc)).toString();
            log(`Token bal. of ${randomAcc}: deposit bal. ${nTokens}, deposit bal.$ ${(await ctrCT.calcDollars(nTokens))}`);
        }
        log(`WETH price ${(await ctrCT.getTokenPrice())}$`);
    });

    it('Check my spins available', async function(){
        let accountsTest = accounts.slice(4, 10);
        for(const randomAcc of accountsTest){
            log(`Daily spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
        }
    });

    it('Test manual funding', async function(){
        try {
            log(`Subscription balance before funding: ${(await ctrVRFC.getSubscription((await ctrAPK.s_subscriptionId()))).balance}`);
            await ctrAPK.fundSubscription({value: toWei("0.6")});
            log(`Subscription balance after funding: ${(await ctrVRFC.getSubscription((await ctrAPK.s_subscriptionId()))).balance}`);
            return assert.isTrue(true);
        } catch(ex) {
            log(`Error: ${ex.toString()}`);
            return assert.isTrue(false);
        }
    });

    it('Perform several bets and check cost', async function(){
        let accountsTest = accounts.slice(4, 10);
        log(`Subscription balance before funding: ${(await ctrVRFC.getSubscription((await ctrAPK.s_subscriptionId()))).balance}`);
        //log(`LINK balance roulette: ${(await ctrLINK.balanceOf(ctrAPK.address))}, ETH balance ${(await getAccountBalance(ctrAPK.address))}`);
        for(const randomAcc of accountsTest){
            log(`Daily spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
            log(``)

            let gasNeeded = await ctrAPK.performBet.estimateGas(10, { from: randomAcc });
            log(`Gas needed paid bet 10$ ${gasNeeded}`);                   
            await ctrAPK.performBet(10, { from: randomAcc });
            log(`${randomAcc} bet performed`);

            log(`Daily spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
            log(``)
        }
        //log(`LINK balance roulette: ${(await ctrLINK.balanceOf(ctrAPK.address))}, ETH balance ${(await getAccountBalance(ctrAPK.address))}`);
        log(`Subscription balance after funding: ${(await ctrVRFC.getSubscription((await ctrAPK.s_subscriptionId()))).balance}`);
    });

    it('Solve bets and check cost', async function(){
        let betsPendingSolve = await ctrBM.getBetsPendingSolve(30);

        log(`Number of bets pending solve: ${betsPendingSolve.length}`);
        for(let betPending of _.filter(betsPendingSolve, (_a) => _a > 0)){
            let answer = await simulateSpin(ctrBM, betPending); 
            let gasNeeded = await ctrAPK.solveBet.estimateGas(betPending, answer[0][0], answer[0][1]);
            log(`Solving bet (index: ${betPending}), gas needed: ${gasNeeded}`);                   
            await ctrAPK.solveBet(betPending, answer[0][0], answer[0][1]);
        }
    });

    it('Claim bets and check deposits and cost', async function(){
        let accountsTest = accounts.slice(4, 10);         
        for(const randomAcc of accountsTest){
            let balanceRoulette = await ctrCT.balanceOf(randomAcc);
            let claimBets = await ctrBM.getUserPendingBetsClaim(randomAcc);
            log(`Claiming bets for ${randomAcc}, ${claimBets.length} bets pending claim`);
            for(const betIndex of claimBets){
                log(`Claiming bet index... ${betIndex}`);
                await ctrAPK.claimBet(betIndex, { from: randomAcc });
                log(`Bet index ${betIndex} claimed, roulette balance ${(await ctrCT.calcDollars(balanceRoulette)).toString()}$ -> ${(await ctrCT.calcDollars((await ctrCT.balanceOf(randomAcc)))).toString()}`);
            }
        }
    });

    it('Check profits and spins left', async function(){
        let accountsTest = accounts.slice(4, 10);
        for(const randomAcc of accountsTest){
            log(`Daily spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
            log(``)
        }
    });

    it('Check profits and spins after half day', async function(){
        await increase(86400 * 0.5);
        let accountsTest = accounts.slice(4, 10);
        for(const randomAcc of accountsTest){
            log(`Daily paid spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
            log(``)
        }
    });

    it('Check profits and spins after 1 day', async function(){
        await increaseDays(1);
        let accountsTest = accounts.slice(4, 10);
        for(const randomAcc of accountsTest){
            log(`Daily spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
            log(``)
        }
    });

    it('Check profits and spins after 1 week', async function(){
        await increaseDays(7);
        let accountsTest = accounts.slice(4, 10);
        for(const randomAcc of accountsTest){
            log(`Daily spins left (${randomAcc}): ${(await ctrSM.getUserDailySpinsLeft(randomAcc))} / ${(await ctrSM.maxDailySpins())}`);
            log(`Daily profits (${randomAcc}): ${(await ctrPM.maxDailyProfit()).sub((await ctrPM.amountLeftForDailyMaxProfit(randomAcc)))} / ${(await ctrPM.maxDailyProfit())}`);
            log(`Weekly profits (${randomAcc}): ${(await ctrPM.maxWeeklyProfit()).sub((await ctrPM.amountLeftForWeeklyMaxProfit(randomAcc)))} / ${(await ctrPM.maxWeeklyProfit())}`);
            log(``)
        }
    });
});