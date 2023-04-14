//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {Campaign} from "./Campaign.sol";

import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

contract CampaignFactory {
    address public owner;
    ISuperToken public token;

    constructor(ISuperToken _tokenX, address _owner) {
        owner = _owner;
        token = ISuperToken(_tokenX);
    }

    function deployCampaign() public payable {
        new Campaign(token, owner);
    }
}
