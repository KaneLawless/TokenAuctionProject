//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./MyToken.sol";

contract ForwardAuction {

    IERC20 public token;

    // Auction Parameters
    address public beneficiary;
    uint public auctionEndTime;
    uint prize;


    // Current state of the auction
    address public highestBidder;
    uint public highestBid;
    
    mapping(address => uint) public currentAddressBid;
        
    event HighestBidIncrease(address bidder, uint bid);
    
    constructor(
        uint _biddingTime,
        address payable _beneficiary,
        IERC20 _tokenAddress,
        uint _prize
        ) 
        
        { 
            beneficiary = _beneficiary;
            auctionEndTime = block.timestamp + _biddingTime;
            token = _tokenAddress;
            prize = _prize;

        }

 
    function returnAuctionEndTime() public view returns(uint) {
        return auctionEndTime;
    }

    function submitBid(uint _bid) public {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        require(_bid > highestBid, "Bid must be higher than current highest bid");
        require(msg.sender != highestBidder, "You are already the highest bidder");

        token.transferFrom(msg.sender, address(this), _bid); 


        currentAddressBid[msg.sender] = _bid;

        if (highestBid > 0) {
            token.transfer(highestBidder,highestBid); 
            currentAddressBid[highestBidder] -= highestBid;
            
        }

        assert(currentAddressBid[highestBidder] == 0);

        highestBid = _bid;
        highestBidder = msg.sender;

        assert(token.balanceOf(address(this)) == highestBid + prize);

        emit HighestBidIncrease(msg.sender,_bid);

        if ((auctionEndTime - block.timestamp) < 30) {
            auctionEndTime += 30;
            returnAuctionEndTime(); 
        }
    }


   function payWinner() public {
       require(msg.sender == highestBidder);
       assert(token.balanceOf(address(this)) == highestBid + prize);
       
       token.transfer(beneficiary, highestBid);

       currentAddressBid[highestBidder] -= highestBid;
       token.transfer(highestBidder, prize);

   } 
     
    receive() external payable {

    }

    

    
}

