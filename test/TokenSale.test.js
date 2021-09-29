const TokenSale = artifacts.require("TokenSale");
const Token = artifacts.require("MyToken");

const chai = require("./chaisetup.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("TokenSale Test", async (accounts) => {

    const [ deployerAccount, recipient, anotherAccount ] = accounts;

    it("Should be no tokens in deployerAccount", async () => {
        let instance = await Token.deployed();
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(0));
    })

    it("95% of Tokens should be in the TokenSale contract", async () => {
        let instance = await Token.deployed();
        let initialTransfer = new BN(process.env.INITIAL_TRANSFER);
        return await expect(instance.balanceOf(
            TokenSale.address)).to.eventually.be.a.bignumber.equal(initialTransfer);
    })

    it("It should be possible to buy tokens", async () => {
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let balanceBefore =  await tokenInstance.balanceOf(deployerAccount);
        let balanceAfter =  new BN(1000000);
        await expect(tokenSaleInstance.sendTransaction({
            from: deployerAccount, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled;
        return await expect(tokenInstance.balanceOf(
            deployerAccount)).to.eventually.be.a.bignumber.equal(balanceBefore.add(balanceAfter));

    });
    
});