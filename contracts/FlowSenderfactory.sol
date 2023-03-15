//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {FlowSender} from "./FlowSender.sol";

import { ISuperfluid, ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";


contract FlowSenderFactory {
    mapping (address => FlowSender) public accountList;

    event ContractCreated(address flowSenderAddress);

    ISuperToken public fUSDCx = ISuperToken(0x42bb40bF79730451B11f6De1CbA222F17b87Afd7);
    ISuperfluid public hostPolygon = ISuperfluid(0xEB796bdb90fFA0f28255275e16936D25d3418603);

    address public owner;
    
     constructor(){   
        owner = msg.sender;
    }

    function deployFlowSender(address _client, int96 _amountFlowRate) external returns(address flowSenderAddress){
        FlowSender newFlowSender = new FlowSender(hostPolygon, fUSDCx, _amountFlowRate);

        accountList[_client] = newFlowSender;
        flowSenderAddress = address(newFlowSender);

        emit ContractCreated(flowSenderAddress);
    }
}