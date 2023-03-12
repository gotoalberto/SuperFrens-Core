//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {FlowSender} from "./FlowSender.sol";

import { ISuperfluid, ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";


contract FlowSenderFactory {
    mapping (address => FlowSender) public accountList;

    event ContractCreated(address newAddress);

    ISuperToken fUSDCx = ISuperToken(0x42bb40bF79730451B11f6De1CbA222F17b87Afd7);
    ISuperfluid hostPolygon = ISuperfluid(0xEB796bdb90fFA0f28255275e16936D25d3418603);

    function deployFlowSender(address _client, int96 amountFlowRate) public payable{
        FlowSender newFlowSender = new FlowSender(hostPolygon, fUSDCx, amountFlowRate);
        accountList[_client] = newFlowSender;
        emit ContractCreated(address(newFlowSender));
    }
}