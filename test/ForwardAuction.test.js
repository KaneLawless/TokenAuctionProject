const Auction = artifacts.require("ForwardAuction");
const Token = artifacts.require("MyToken");
const TokenSale = artifacts.require("TokenSale");



const chai = require("./chaisetup.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract ("ForwardAuctionTest", async (accounts) => {
    const [ deployerAccount, recipient, anotherAccount ] = accounts;

    it("Should have 'PRIZE' amount of tokens", async () => {
        let tokenInstance = await Token.deployed();
        let auctionInstance = await Auction.deployed();
        let auctionTokens = new BN(process.env.PRIZE);
        return await expect(tokenInstance.balanceOf(
            Auction.address)).to.eventually.be.a.bignumber.equal(auctionTokens);
    }
    )

    it("Should be able to give permission to the contract for the spending of tokens", async () => {
        let auctionInstance = await Auction.deployed();
        let tokenInstance = await Token.deployed();
        allowance = new BN("2").pow(new BN("256").sub(new BN("1")));
        return await expect(tokenInstance.approve(Auction.address, allowance)).to.eventually.be.fulfilled;
    })

    it("Shouldn't be possible to send winnings unless caller is the winner", async () => {
        let auctionInstance = await Auction.deployed();
        let tokenInstance = await Token.deployed();

        return await expect(auctionInstance.payWinner()).to.eventually.be.rejected;
    })
    it("Should be possible to make a bid", async () => {
        let auctionInstance = await Auction.deployed();
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let tokenAmount = new BN(process.env.PRIZE).add((new BN(1).pow(new BN(18))));
        
        // Buy 1 token to use to make a bid
        await tokenSaleInstance.sendTransaction({from: deployerAccount, value:web3.utils.toWei(
            "1000000000000", "wei")});

        //  Submit bid of 1 token
        await expect(auctionInstance.submitBid(1)).to.eventually.be.fulfilled;

        // Ensure token balance of Auction contract increased by 1 token
        return await expect(tokenInstance.balanceOf(
            Auction.address)).to.eventually.be.a.bignumber.equal(tokenAmount);

    })

    it("Should send winnings if you're the winner and highestBid to the beneficiary", async () => {
        let auctionInstance = await Auction.deployed();
        let tokenInstance = await Token.deployed();
        //let tokenSaleInstance = await TokenSale.deployed();

        let balanceBefore = await tokenInstance.balanceOf(deployerAccount);
        let beneBal = await tokenInstance.balanceOf(recipient);

        // Pay winner
        await expect(auctionInstance.payWinner()).to.eventually.be.fulfilled;

        // Check token balance of contract to be 0
        await expect(tokenInstance.balanceOf(Auction.address)).to.eventually.be.a.bignumber.equal(new BN(0));

        // Check token balance of winner has increased by the prize
        let prize = new BN(process.env.PRIZE);
        balanceAfter = new BN(balanceBefore.add(prize)); 
        await expect(tokenInstance.balanceOf(
            deployerAccount)).to.eventually.be.a.bignumber.equal(balanceAfter);

        // Check token balance of beneficiary has increased by highest bid
        let highBid = await auctionInstance.highestBid;
        return await expect(tokenInstance.balanceOf(
            recipient)).to.eventually.be.a.bignumber.equal(beneBal.add(highBid));
    })


})

