import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import TokenSale from "./contracts/TokenSale.json";
import KycContract from "./contracts/KycContract.json";
import ForwardAuction from "./contracts/ForwardAuction.json";

import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, kycAddress: "0x0000", tokenSaleAddress: null, userTokens: 0, highestBid: 0, bid: 0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.getChainId();
      

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        TokenSale.abi,
        TokenSale.networks[this.networkId] && TokenSale.networks[this.networkId].address,
      );

      this.KycContractInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      this.ForwardAuctionInstance = new this.web3.eth.Contract(
        ForwardAuction.abi,
        ForwardAuction.networks[this.networkId] && ForwardAuction.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState({ loaded: true, tokenSaleAddress: TokenSale.networks[this.networkId].address }, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleKycWhitelisting = async () => {
    await this.KycContractInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
    alert("Kyc for " + this.state.kycAddress + " is completed");

  }

  updateUserTokens = async () => {
    let userTokens =  await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens: userTokens / 1000000000000000000});
  }

  listenToTokenTransfer = () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens);
    this.tokenInstance.events.Transfer({from: this.accounts[0]}).on("data", this.updateUserTokens);

  }

  handleBuyTokens = async() => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: 1000000000000});
  }

  getCurrentHighestBid =  async() => {
    let highestBid = await this.ForwardAuctionInstance.methods.highestBid().call();
    this.setState({highestBid: highestBid});
    console.log(highestBid);
  }

  approveSpend = async() => {
    let maxSpend = 1000000000000000000 ;
    let forwardAuctionAddress = ForwardAuction.networks[this.networkId].address;
    await this.tokenInstance.methods.approve(forwardAuctionAddress, maxSpend.toString()).send({from: this.accounts[0]});
    
  }

  enterBid = async() => {
    await this.ForwardAuctionInstance.methods.submitBid(this.state.bid).send({from: this.accounts[0]});
    
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>PokerNFT Chips Sale (CHIPS)</h1>
        <p>Buy some CHIPS and hit the tables!</p>
        <h2>First - let us add you address to the KYC whitelist</h2>
        Please enter your address: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleKycWhitelisting} >Whitelist my address</button>
        <h2>Buy some CHIPS! </h2>
        <p>Send Ether to: {this.state.tokenSaleAddress} to receive CHIPS, 1 ETH =  1,000,000 CHIPS</p>
        <p>You currently have {this.state.userTokens} CHIPS!</p>
        <button type="button" onClick={this.handleBuyTokens} >Click to buy 1 CHIPS!</button>
        <p> ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</p>
        <p>Welcome to the Auction House!</p>
        <p>Highest Bid: {this.state.highestBid} </p>
        <button type="button" onClick={this.getCurrentHighestBid}> Update current highest bid </button>
        <p>Bid amount <input type="text" name="bid" value={this.state.bid} onChange={this.handleInputChange}/></p>
        <button type="button" onClick={this.approveSpend} >Approve Spend</button><button type="button" onClick={this.enterBid} >Enter Bid</button> 

      </div>
    );
  }
}

export default App;
