//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Campaign {
    using SuperTokenV1Library for ISuperToken;

    ISuperToken internal immutable tokenX;
    ERC20 internal immutable baseToken;
    uint256 internal fee;
    uint256 internal amount;

    constructor(ISuperToken _tokenX, address _operator) {
        tokenX = _tokenX;
        tokenX.setMaxFlowPermissions(_operator);
        baseToken = ERC20(tokenX.getUnderlyingToken());
        amount = baseToken.balanceOf(address(this));
        fee = (amount * 300) / 10000;
        baseToken.transfer(_operator, fee);
        baseToken.approve(address(tokenX), (amount - fee));
        _upgrade();
    }

    function _upgrade() internal {
        tokenX.upgrade(baseToken.balanceOf(address(this)));
    }
}
