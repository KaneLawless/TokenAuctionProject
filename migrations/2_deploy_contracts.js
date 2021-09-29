var MyToken = artifacts.require("MyToken");
var TokenSale = artifacts.require("TokenSale");
var ForwardAuction = artifacts.require("ForwardAuction");

require("dotenv").config({path: "../.env"});


module.exports = async function(deployer) {
    let addr =  await web3.eth.getAccounts();
    await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
    await deployer.deploy(TokenSale, 1000000, addr[0], MyToken.address);
    let instance = await MyToken.deployed();
    await instance.transfer(TokenSale.address, process.env.INITIAL_TRANSFER);
    await deployer.deploy(ForwardAuction, 120, addr[2], MyToken.address, process.env.PRIZE);
    await instance.transfer(ForwardAuction.address, process.env.PRIZE);
   
}
