//SPDX-License-Identifier: Unlicensedpragma solidity 0.8.14;

import { ISuperfluid, ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FlowSender {
    using CFAv1Library for CFAv1Library.InitData;

    CFAv1Library.InitData public cfaV1;    

    mapping (address => bool) public accountList;  

    ISuperToken public tokenX;

    int96 public amountFlowRate;   

    ERC20 fUSDC = ERC20(0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2);

    constructor(ISuperfluid _host, ISuperToken _tokenX, int96 _amountFlowRate) {   
        cfaV1 = CFAv1Library.InitData(_host,IConstantFlowAgreementV1(address(
            _host.getAgreementClass(
                keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
            )
        )));
        tokenX = _tokenX;        
        amountFlowRate = _amountFlowRate;
    }

    /// @dev Mints 10,000 fDAI to this contract and wraps it all into fDAIx    
    function gainTokenX(uint256 amount) external {
        fUSDC.transferFrom(msg.sender, address(this), amount);

        // Approve fDAIx contract to spend fDAI
        fUSDC.approve(address(tokenX), 2 * amount);

        // Wrap the fDAI into fDAIx        
        tokenX.upgrade(amount);
    }

    /// @dev creates a stream from this contract to desired receiver at desired rate   
     function createStream(address receiver) external {
        int96 flowRate = amountFlowRate / 2592000;       
        cfaV1.createFlow(receiver, tokenX, flowRate);
    }

    /// @dev deletes a stream from this contract to desired receiver   
     function deleteStream(address receiver) external {
        cfaV1.deleteFlow(address(this), receiver, tokenX);    
    }

    /// @dev get flow rate between this contract to certain receiver
    function readFlowRate(address receiver) external view returns (int96 flowRate) {       
         (,flowRate,,) = cfaV1.cfa.getFlow(tokenX, address(this), receiver);
    }
}