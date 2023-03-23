//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {FlowSender} from "./FlowSender.sol";

import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

contract FlowSenderFactory {
    mapping(address => FlowSender) public accountList;

    event ContractCreated(address newAddress);

    address public owner;
    ISuperToken public token;
    ISuperfluid public host;

    constructor(ISuperfluid _host, ISuperToken _tokenX, address _owner) {
        owner = _owner;
        token = ISuperToken(_tokenX);
        host = ISuperfluid(_host);
    }

    function deployFlowSender(
        address _client,
        int96 amountFlowRate
    ) public payable {
        FlowSender newFlowSender = new FlowSender(
            host,
            token,
            amountFlowRate,
            owner
        );
        accountList[_client] = newFlowSender;
        emit ContractCreated(address(newFlowSender));
    }
}
