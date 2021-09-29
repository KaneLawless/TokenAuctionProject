import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import TokenSale from "./contracts/TokenSale.json";
import ForwardAuction from "./contracts/ForwardAuction.json";
import getWeb3 from "./getWeb3";
import "./App.css";

var Web3 = require("web3");
var BN = Web3.utils.toBN;

const decimals = new BN(1000000000000000000).toString();

class App extends Component {
  state = { loaded: false, tokenSaleAddress: null, userTokens: 0, highestBid: 0, bid: 0, tokenAmountToBuy: 0, formattedTime: 0, winner: ""};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      this.networkId = await this.web3.eth.getChainId();
      
      // Get the contract instances.

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        TokenSale.abi,
        TokenSale.networks[this.networkId] && TokenSale.networks[this.networkId].address,
      );
      
      this.ForwardAuctionInstance = new this.web3.eth.Contract(
        ForwardAuction.abi,
        ForwardAuction.networks[this.networkId] && ForwardAuction.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.listenToBidIncrease();
      this.setState({ loaded: true, tokenSaleAddress: TokenSale.networks[this.networkId].address },  this.updateUserTokens);
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

  updateUserTokens = async () => {
    let userTokens =  await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens: userTokens / decimals});
  }

  listenToTokenTransfer = () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens);
    this.tokenInstance.events.Transfer({from: this.accounts[0]}).on("data", this.updateUserTokens);

  }

  listenToBidIncrease = () => {
    this.ForwardAuctionInstance.events.HighestBidIncrease().on("data", this.getCurrentHighestBid);
  }

  handleBuyTokens = async() => {
    const rate = new BN(1000000000000);
    var val = new BN(this.state.tokenAmountToBuy).toString();
    var amount = new BN(val * rate);
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: amount});
  }

  getCurrentHighestBid =  async() => {
    let highestBid = await this.ForwardAuctionInstance.methods.highestBid().call() / decimals;
    this.setState({highestBid: highestBid});
    
  }

  approveSpend = async() => {
    const maxSpend = new BN("2").pow(new BN("256").sub(new BN("1")));
    const forwardAuctionAddress = ForwardAuction.networks[this.networkId].address;
    await this.tokenInstance.methods.approve(forwardAuctionAddress, maxSpend.toString()).send({from: this.accounts[0]});
   
  }
  
  enterBid = async() => {
    const fullBid = new BN(this.state.bid).mul(new BN(decimals));
    await this.ForwardAuctionInstance.methods.submitBid(fullBid.toString()).send({from: this.accounts[0]});
    this.returnAuctionEndTime();
    
    
  }

  returnAuctionEndTime = async() => {
    let endTime = await this.ForwardAuctionInstance.methods.auctionEndTime().call();
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(endTime * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    this.setState({formattedTime: formattedTime});

  }

  receivePrize = async() => {
    await this.ForwardAuctionInstance.methods.payWinner().send({from: this.accounts[0]});
  }

  checkWinner = async() => {
    let winner = await this.ForwardAuctionInstance.methods.highestBidder().call();
    let time = await this.ForwardAuctionInstance.methods.auctionEndTime().call();
    let nowTime = Date.now() / 1000;
    let result;
    
    if (nowTime < time) { 
      result = "The auction isn't over yet";
    } else if (winner !== this.accounts[0])  {
      result = "Sorry you didn't win this time";
    } else if (winner === this.accounts[0] && Date.now() > time) {
      result = "Congratulations, you won the Auction";
      this.receivePrize(); 
    } 
    
    this.setState({winner : result});
    
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Auction Token Sale (aucT)</h1>
        <p>Buy some aucT to bid on the auction!</p>
        <h2>Buy some aucT! </h2>
        <p>Enter number of aucT to buy. 1 ETH =  1,000,000 aucT</p>
        <input type="text" name="tokenAmountToBuy" value={this.state.tokenAmountToBuy} onChange={this.handleInputChange}></input>
        <button type="button" onClick={this.handleBuyTokens} >Click to buy aucT!</button>
        <p>You currently have {this.state.userTokens} aucT!</p>
        <p> ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</p>
        <p>Welcome to the Auction House!</p>
        <p>Highest Bid: {this.state.highestBid}</p>
        <button type="button" onClick={this.getCurrentHighestBid}> Update current highest bid </button>
        <p>Bid amount <input type="text" name="bid" value={this.state.bid} onChange={this.handleInputChange}/></p>
        <button type="button" onClick={this.approveSpend} >Approve Spend</button><button type="button" onClick={this.enterBid} >Enter Bid</button> 
        <p>Ending Time: {this.state.formattedTime} </p>
        <button type="button" onClick={this.returnAuctionEndTime}> Check Ending Time </button><button type="button" onClick={this.checkWinner}> Check winner</button><p>{this.state.winner}</p>
      </div>
    );
  }
}

export default App;
