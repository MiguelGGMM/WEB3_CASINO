try{
  const DEAD_ADDRESS = `0x0000000000000000000000000000000000000000`;
  console.log('Migrating');

  require('dotenv').config({path: "../.env"});

  const casinoTreasury = artifacts.require("CasinoTreasury");
  const roulette = artifacts.require("Roulette");
  var mainnet = false;

  module.exports = function(deployer) {
    if(mainnet){
      return deployer.deploy(casinoTreasury, process.env.CHAINLINK_PRICEDF).then(_a => deployer.deploy(roulette, casinoTreasury.address, process.env.CHAINLINK_VRFCOORD, process.env.CHAINLINK_TOKEN, process.env.LINK_LIQ_POOL));
    }else{
      return deployer.deploy(casinoTreasury, process.env.CHAINLINK_PRICEDF).then(_a => deployer.deploy(roulette, casinoTreasury.address, process.env.CHAINLINK_VRFCOORD, process.env.CHAINLINK_TOKEN, process.env.LINK_LIQ_POOL));
    }
  };

}catch(err){
  console.log(err.toString());
}