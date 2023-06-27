/*
    Casino treasury contract - Arbitrum Gambling
    Developed by Kerry <TG: campermon>
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BasicLibraries/SafeMath.sol";
import "./BasicLibraries/Context.sol";
import "./BasicLibraries/Auth.sol";
import "./BasicLibraries/IBEP20.sol";
import "./Chainlink/IAggregator.sol";

contract CasinoTreasury is Context, Auth {
    using SafeMath for uint256;

    // Event deposit tokens
    event DepositTokens(address indexed adr, uint256 tokensDeposited, uint256 currentDepositDollars);
    // Event withdraw tokens
    event WithdrawTokens(address indexed adr, uint256 tokensWithdrawed, uint256 currentDepositDollars);

    // ETH each user has stored in contract balance
    mapping (address => uint256) public balances;

    // Casino contracts that can update contract treasury balance
    mapping (address => bool) public casinoContracts;

    // Total ETH users
    uint256 public totalETHUsers = 0;

    // A certain amount of each deposit will be send to owner
    uint8 public taxesPc = 5; 

    // People can not play if closed but will be able to withdraw their tokens
    bool public casinoOpen = false;

    // Custom error message
    string public withdrawError = "Wait till owners replenish the token pool or contact them @campermon on telegram";

    // Chainlink token price datafeed
    IAggregator public chainlinkPriceDF; // 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612 // arbitrum

    /**
     * Function modifier to require caller to be a whitelisted contract
     */
    modifier onlyCasino() {
        require(casinoContracts[msg.sender], "Only casino contracts can call this function"); _;
    }

    constructor (address _chainlinkPriceDF) Auth(msg.sender) { 
        chainlinkPriceDF = IAggregator(_chainlinkPriceDF); 
        require(getTokenPrice() != 0, "Error with datafeed: price");
        require(getTokenDecimals() != 0, "Error with datafeed: decimals");
    }

    receive() external payable { }

    //region VIEWS

    function getOwner() public view returns (address) {return owner;}
    function balanceOf(address _account) public view returns (uint256) { return balances[_account]; }
    function isContract(address _account) public view returns (bool) { return _account.code.length > 0; }
    function isEmptyString(string memory _string) public pure returns (bool) { return bytes(_string).length == 0; }
    function contractPool() public view returns(uint256) { return address(this).balance; }
    function contractPoolSubUsers() public view returns(uint256) { return contractPool().sub(totalETHUsers); }
 
    //endregion

    //region UTILS

    function _UpdateBalancesSub(address adr, uint256 _nTokens) internal {
        balances[adr] -= _nTokens;
        totalETHUsers -= _nTokens;
    }
    function UpdateBalancesSub(address adr, uint256 _nTokens) public onlyCasino { _UpdateBalancesSub(adr, _nTokens); }

    function _UpdateBalancesAdd(address adr, uint256 _nTokens) internal {
        balances[adr] += _nTokens;
        totalETHUsers += _nTokens;
    }
    function UpdateBalancesAdd(address adr, uint256 _nTokens) public onlyCasino { _UpdateBalancesAdd(adr, _nTokens); }

    function TaxPayment(uint256 _nTokens) public onlyCasino returns(bool) {
        // Will be send to they caller to pay link tokens
        (bool success,) = payable(msg.sender).call{value: _nTokens.mul(taxesPc).div(100)}("");
        require(success, "Error sending ETH to caller");
        return success;
    }    
   
    //endregion

    function depositTokens() public payable {
        require(casinoOpen, "You only can deposit if the casino is opened");
        require(!isContract(_msgSender()), "Contracts not allowed");
        _UpdateBalancesAdd(_msgSender(), msg.value);

        emit DepositTokens(_msgSender(), msg.value, calcDollars(msg.value));
    }

    function withdrawTokens(uint256 _nTokens) public {  
        require(balanceOf(_msgSender()) >= _nTokens, "You have not that number of tokens to withdraw");
        _UpdateBalancesSub(_msgSender(), _nTokens);
        (bool success,) = payable(_msgSender()).call{value: _nTokens}("");
        require(success, isEmptyString(withdrawError) ? "Wait till owners replenish the token pool" : withdrawError);

        emit WithdrawTokens(_msgSender(), _nTokens, calcDollars(_nTokens));
    }

    //endregion 

    //region ADMIN

    //region MAIN

    function OpenCasino(bool _open) public onlyOwner { casinoOpen = _open; }

    function setWithdrawError(string memory _string) public onlyOwner { withdrawError = _string; }

    function clearStuckToken(address _tokenAddress, uint256 _tokens) public onlyOwner returns (bool) {
        if(_tokens == 0){
            _tokens = IBEP20 (_tokenAddress).balanceOf(address(this));
        }
        return IBEP20 (_tokenAddress).transfer(msg.sender, _tokens);
    }
    
    //endregion

    //region TOKEN PRICE

    function calcTokensFromDollars(uint256 _dollars) public view returns(uint256) {
        return _dollars.mul(10 ** (getTokenDecimals() + 18)).div(getTokenPrice());
    }

    function calcDollars(uint256 _nTokens) public view returns(uint256) {
        return getTokenPrice().mul(_nTokens).div(10 ** getTokenDecimals());
    }

    function getTokenPrice() public view returns(uint256) {
        return uint256(chainlinkPriceDF.latestAnswer());
    }

    function getTokenDecimals() public view returns(uint8) {
        return chainlinkPriceDF.decimals();
    }

    //endregion

    function whitelistCasinoContract(address _adr, bool _allow) public onlyOwner { casinoContracts[_adr] = _allow; }

    //endregion
}