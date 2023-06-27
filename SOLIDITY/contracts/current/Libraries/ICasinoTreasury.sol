// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICasinoTreasury {
    function UpdateBalancesAdd(address _adr, uint256 _nTokens) external;
    function UpdateBalancesSub(address _adr, uint256 _nTokens) external;
    function TaxPayment(uint256 _nTokens) external returns(bool);
    function balanceOf(address _adr) external returns(uint256);
    function withdrawError() external returns(string memory);
    function calcTokensFromDollars(uint256 _nDollars) external view returns(uint256);
    function calcDollars(uint256 _nTokens) external view returns(uint256);
    function tokenAdr() external returns(address);
}