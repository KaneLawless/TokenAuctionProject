const Token = artifacts.require("MyToken");

const chai = require("./chaisetup.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("Token Test", async (accounts) => {
    const [ deployerAccount, recipient, anotherAccount ] = accounts;

    beforeEach(async() => {
        this.myToken = await Token.new(process.env.INITIAL_TOKENS)
    })


    it("All tokens should be in my account", async () => {
    let instance = this.myToken;
    let totalSupply = await instance.totalSupply();
        //let balance = await instance.balanceOf(accounts[0]);
        //assert.equal(balance.valueOf(), initialSupply.valueOf(), "The balance was not equal");
        // Alternatively we can use the below expect, using chai
        return expect(instance.balanceOf(
            deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
    })

    it("Is not possible to send more tokens than the total supply", async () => {
        let instance = this.myToken;
        let balanceOfDeployer = await instance.balanceOf(deployerAccount);

        await expect(instance.transfer(
            anotherAccount, new BN(balanceOfDeployer+1))).to.eventually.be.rejected;
        return await expect(instance.balanceOf(
            deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);

    })

    it("It is possible to send tokens between accounts", async () => {
        const sendTokens = 1;
        let instance = this.myToken;
        let totalSupply = await instance.totalSupply();
        await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
        await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
        await expect(instance.balanceOf(
            deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));
        return await expect(instance.balanceOf(
            recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
    });

});