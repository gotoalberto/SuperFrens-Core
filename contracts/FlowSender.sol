//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FlowSender {
    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1;

    mapping(address => bool) public accountList;
    ISuperToken public tokenX;
    int96 public amountFlowRate;
    address public owner;

    constructor(
        ISuperfluid _host,
        ISuperToken _tokenX,
        int96 _amountFlowRate,
        address _owner
    ) {
        cfaV1 = CFAv1Library.InitData(
            _host,
            IConstantFlowAgreementV1(
                address(
                    _host.getAgreementClass(
                        keccak256(
                            "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                        )
                    )
                )
            )
        );
        owner = _owner;
        tokenX = _tokenX;
        amountFlowRate = _amountFlowRate;
    }

    function gainTokenX(uint256 amount) external {
        ERC20 erc20 = ERC20(tokenX.getUnderlyingToken());
        erc20.transferFrom(msg.sender, address(this), amount);

        uint256 fee = (amount * 300) / 10000;
        erc20.transfer(owner, fee);

        erc20.approve(address(tokenX), 2 * (amount - fee));
        tokenX.upgrade(amount - fee);
    }

    function createStream(address receiver) external {
        int96 flowRate = amountFlowRate / 2592000;
        cfaV1.createFlow(receiver, tokenX, flowRate);
        accountList[receiver] = true;
    }

    function deleteStream(address receiver) external {
        cfaV1.deleteFlow(address(this), receiver, tokenX);
        accountList[receiver] = false;
    }

    function updateStream(int96 flowRate, address receiver) external {
        cfaV1.updateFlow(receiver, tokenX, flowRate);
    }
}
