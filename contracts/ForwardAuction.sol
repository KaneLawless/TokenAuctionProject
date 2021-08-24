//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./MyToken.sol";

contract ForwardAuction {

    IERC20 token;

    // Auction Parameters
    address payable public  beneficiary;
    uint auctionEndTime;
    
    // Current state of the auction
    address public highestBidder;
    uint public highestBid;
    
    mapping(address => uint) public currentAddressBid;
    
    bool ended = false;
    
    event HighestBidIncrease(address bidder, uint bid);
    event AuctionEnded(address winner, uint amount);
    
    constructor(
        uint _biddingTime,
        address payable _beneficiary,
        IERC20 _tokenAddress
        ) 
        
        { 
            beneficiary = _beneficiary;
            auctionEndTime = block.timestamp + _biddingTime;
            token = _tokenAddress;
            
        }

    function returnHighestBid() public view returns(uint) {
        return highestBid;
    }
    

    function submitBid(uint _bid) public {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        require(_bid > highestBid, "Bid must be higher than current highest bid");
        
        token.transferFrom(msg.sender, address(this), _bid); 

        
        currentAddressBid[msg.sender] += _bid;
        
        highestBid = _bid;
        highestBidder = msg.sender;
        
        emit HighestBidIncrease(msg.sender,_bid);

        
    
    }

   
         

    
}

