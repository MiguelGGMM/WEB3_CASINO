/*
    Roulette contract - Arbitrum Gambling
    Developed by Kerry <TG: campermon>
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BasicLibraries/SafeMath.sol";
import "./BasicLibraries/Context.sol";
import "./BasicLibraries/Auth.sol";
import "./BasicLibraries/IBEP20.sol";
import "./Libraries/BetsManager.sol";
import "./Libraries/SpinsManager.sol";
import "./Libraries/ProfitsManager.sol";
import "./Libraries/ICasinoTreasury.sol";
import "./Libraries/IWETH.sol";
import "./Chainlink/VRFv2SubscriptionManager.sol";
import "./Chainlink/VRFCoordinatorV2Interface.sol";
import "./UniswapV3/IUniswapV3PoolActions.sol";
import "./UniswapV3/IUniswapV3PoolImmutables.sol";

contract Roulette is Context, Auth, VRFv2SubscriptionManager {
    using SafeMath for uint256;

    // Event perform bet
    event PerformBet(address indexed adr, uint256 indexed amountBet, uint256 spinsPerformedToday, uint256 spinsLeftToday, uint256 amountLeftForDailyMaxProfit, uint256 amountLeftForWeeklyMaxProfit);
    // Event claim bet
    event ClaimBet(address indexed adr, uint256 betIndex, uint256 indexed dollarsWon, uint256 currentDepositDollars);
    // Event solve bet
    event SolveBet(address indexed adr, uint256 betIndex, uint256 indexed _prizeType, uint256 _prizeSubtype);
    // Event cancel bet
    event CancelBet(address indexed adr, uint256 betIndex, uint256 indexed dollarsTransferred);
    // Fund subscription
    event FundSubscription(uint256 amount);

    // Casino treasury
    ICasinoTreasury casinoTreasury;

    // Bets manager
    BetsManager betsManager;

    // Profits manager
    ProfitsManager profitsManager;

    // Spins manager
    SpinsManager spinsManager;

    // LINK SWAPS
    IUniswapV3PoolActions linkLiqPoolActions;
    IUniswapV3PoolImmutables linkLiqPoolInmutables;
    // The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
    uint160 internal constant MIN_SQRT_RATIO = 4295128739; // ((1.0001^-887220)^(1/2))*2^96

    constructor (address _casinoTreasury, address _vrfCoord, address _linkAdr, address _linkPool) Auth(msg.sender) VRFv2SubscriptionManager(_vrfCoord, _linkAdr) { 
        casinoTreasury = ICasinoTreasury(_casinoTreasury);
        betsManager = new BetsManager(address(this), _casinoTreasury);
        profitsManager = new ProfitsManager(address(this));
        spinsManager = new SpinsManager(address(this), _casinoTreasury);
        linkLiqPoolActions = IUniswapV3PoolActions(_linkPool);
        linkLiqPoolInmutables = IUniswapV3PoolImmutables(_linkPool);  
    }

    //region VIEWS

    function getOwner() public view returns (address) {return owner;}
    function isEmptyString(string memory _string) public pure returns (bool) { return bytes(_string).length == 0; }

    //endregion

    //region MANAGERS VIEW

    function getBetManagerAdr() public view returns(address) { return address(betsManager); }
    function getProfitsManagerAdr() public view returns(address) { return address(profitsManager); }
    function getSpinsManagerAdr() public view returns(address) { return address(spinsManager); }
    function getCasinoTreasuryAdr() public view returns(address) { return address(casinoTreasury); }

    //endregion

    function performBet(uint256 betAmount) public {
        address adr = _msgSender();
        uint256 tokensRequired = casinoTreasury.calcTokensFromDollars(betAmount);
        require(tokensRequired <= casinoTreasury.balanceOf(adr), "You have not enough tokens");

        // Did you reach the max profit per day
        require(!profitsManager.maxDailyProfitReached(adr), "Max daily profit reached, try again tomorrow");

        // Did you reach the max profit per week
        require(!profitsManager.maxWeeklyProfitReached(adr), "Max weekly profit reached, try again soon");

        // Performs the bet
        betsManager._performBet(betAmount, adr);

        // Remove tokens from your balance
        casinoTreasury.UpdateBalancesSub(adr, tokensRequired);

        // Register the spin
        spinsManager.registerDailySpin(adr);

        // Register losses
        profitsManager.registerLosses(adr, betAmount);

        // Request random word for solving
        requestRandomWords();

        // Some of the amount will be send to the token contract as tax
        bool success = casinoTreasury.TaxPayment(tokensRequired);
        require(success, isEmptyString(casinoTreasury.withdrawError()) ? "Wait till owners replenish the token pool" : casinoTreasury.withdrawError());

        emit PerformBet(adr, betAmount, spinsManager.getUserDailySpinsPerformed(adr), spinsManager.getUserDailySpinsLeft(adr), profitsManager.amountLeftForDailyMaxProfit(adr), profitsManager.amountLeftForWeeklyMaxProfit(adr));
    }

    function claimBet(uint256 betIndex) public {
        address user = betsManager._getBetUser(betIndex);
        require(user == _msgSender() || isAuthorized(_msgSender()), "You are not bet owner or authorized");

        // Claim prize
        uint256 dollarsTransfer = betsManager._claimBet(betIndex);

        // Convert amount and send money to user balance
        if(dollarsTransfer > 0) {
            uint256 _nTokens = casinoTreasury.calcTokensFromDollars(dollarsTransfer);
            casinoTreasury.UpdateBalancesAdd(user, _nTokens);
            // Register profits
            profitsManager.registerProfits(user, dollarsTransfer);
        }

        emit ClaimBet(user, betIndex, dollarsTransfer, casinoTreasury.calcDollars(casinoTreasury.balanceOf(user)));
    }

    function cancelBet(uint256 betIndex) public {
        address user = betsManager._getBetUser(betIndex);
        require(user == _msgSender() || isAuthorized(_msgSender()), "You are not bet owner or authorized");

        // Cancel bet
        uint256 dollarsTransfer = betsManager._cancelBet(betIndex);

        // Convert amount and send money to user balance
        if(dollarsTransfer > 0) {
            uint256 _nTokens = casinoTreasury.calcTokensFromDollars(dollarsTransfer);
            casinoTreasury.UpdateBalancesAdd(user, _nTokens);
            // Register profits
            profitsManager.registerProfits(user, dollarsTransfer);
        }

        emit CancelBet(user, betIndex, dollarsTransfer);
    }

    //endregion   

    //region SOLVER

    function simulateSpin(uint256 randomBase10000) public view returns(uint8, uint8) { 
        return betsManager._simulateSpin(randomBase10000); 
    }

    // AUTHORIZED SOLVER
    function solveBet(uint256 betIndex, uint8 _prizeType, uint8 _prizeSubtype) external authorized {
        _solveBet(betIndex, _prizeType, _prizeSubtype);
    }

    function _solveBet(uint256 betIndex, uint8 _prizeType, uint8 _prizeSubtype) internal {
        address user = betsManager._getBetUser(betIndex);
        betsManager._solveBet(betIndex, _prizeType, _prizeSubtype);

        emit SolveBet(user, betIndex, _prizeType, _prizeSubtype);
    }

    //endregion

    //region CHAINLINK SOLVER

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] memory randomWords) override internal {
        // Get pending bets and solve one, we dont care which one
        (uint8 _prizeType, uint8 _prizeSubtype) = simulateSpin(randomWords[0] % 10000);
        uint256 [] memory pendingBets = betsManager.getBetsPendingSolve(1);
        _solveBet(pendingBets[0], _prizeType, _prizeSubtype);
    }

    function fundSubscription() public payable {
        _fundSubscription(msg.value, true);
    }

    function _fundSubscription(uint256 _amountSent, bool _manual) internal {    
        // WRAP ETH
        IWETH wethI = IWETH(linkLiqPoolInmutables.token0()); // TOKEN0 WETH
        wethI.deposit{value: _amountSent}();
        // APPROVE POOL
        wethI.approve(address(linkLiqPoolActions), type(uint256).max);
              
        bool success = true;
        if(_manual) {
            linkLiqPoolActions.swap(address(this), true, int256(_amountSent), MIN_SQRT_RATIO + 1, abi.encode(0)/*abi.encode(path, payer)*/);
        } else {
            try linkLiqPoolActions.swap(address(this), true, int256(_amountSent), MIN_SQRT_RATIO + 1, abi.encode(0)/*abi.encode(path, payer)*/) {                
            } catch {
                success = false;
            }
        }

        if(success) {
            uint256 tokenBalance = LINKTOKEN.balanceOf(address(this));
            emit FundSubscription(tokenBalance);
            topUpSubscription(tokenBalance);
        }
    }

    function uniswapV3SwapCallback(int256 amount0Delta, int256, bytes calldata) external {
        require(msg.sender == address(linkLiqPoolActions), "Adr not allowed");
        require(amount0Delta > 0, "Not a buy?");

        address weth = linkLiqPoolInmutables.token0();
        IBEP20(weth).transfer(address(linkLiqPoolActions), uint256(amount0Delta));
    }

    //endregion

    //region ADMIN

    //region MAIN

    function clearStuckToken(address _tokenAddress, uint256 _tokens) public onlyOwner returns (bool) {
        if(_tokens == 0){
            _tokens = IBEP20 (_tokenAddress).balanceOf(address(this));
        }
        return IBEP20 (_tokenAddress).transfer(msg.sender, _tokens);
    }    

    function ClearStuckBalance() external onlyOwner { payable(msg.sender).transfer(address(this).balance); }  

    //endregion

    //region PROFITS MANAGER

    function setProfitsManagerAdr(address adr) external onlyOwner { profitsManager = ProfitsManager(adr); }

    function setMaxDailyWeeklyProfit(uint256 _maxDailyProfit, uint256 _maxWeeklyProfit) public onlyOwner {
        profitsManager._setMaxDailyWeeklyProfit(_maxDailyProfit, _maxWeeklyProfit);
    }

    //endregion

    //region SPINS MANAGER

    function setSpinsManagerAdr(address adr) external onlyOwner { spinsManager = SpinsManager(adr); }

    function setMaxDailySpins(uint256 _maxDailySpins) public onlyOwner {
        spinsManager._setMaxDailySpins(_maxDailySpins);
    }

    //endregion

    //region BETS MANAGER

    function setBetManagerAdr(address adr) external onlyOwner { betsManager = BetsManager(adr); }

    function setPrizeChanceOptions( 
        uint8 [] memory _prizeType, 
        uint8 [] memory _prizeSubtype,
        uint256 [] memory _chanceBase10000) public onlyOwner {
            betsManager._setPrizeChanceOptions(_prizeType, _prizeSubtype, _chanceBase10000);
    }

    function setCustomDollarPrize(uint8 _n, uint256 _amount) public onlyOwner { betsManager._setCustomDollarPrize(_n, _amount); }

    function setCustomNFTPrize(uint8 _n, address _address) public onlyOwner { betsManager._setCustomNFTPrize(_n, _address); }

    function enableDisableBetAmount(uint256 _dollarsAmount, bool _enabled) public onlyOwner { betsManager._enableDisableBetAmount(_dollarsAmount, _enabled); }

    //endregion

    //region CHAINLINK_REQ_CONFIG

    function setReqConfig(bytes32 _keyhash, uint32 _callbackGasLimit, uint16 _requestConfirmations, uint32 _numWords) external onlyOwner {
        _setReqConfig(_keyhash, _callbackGasLimit, _requestConfirmations, _numWords);
    }

    //endregion

    //endregion

    receive() external payable {
        _fundSubscription(msg.value, false);
    }
}