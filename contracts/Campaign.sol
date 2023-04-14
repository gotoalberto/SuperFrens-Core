//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.14;

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Campaign {
    using SuperTokenV1Library for ISuperToken;

    ISuperToken internal immutable tokenX;
    ERC20 internal immutable baseToken;

    constructor(ISuperToken _tokenX, address _operator) {
        tokenX = _tokenX;
        tokenX.setMaxFlowPermissions(_operator);
        baseToken = ERC20(tokenX.getUnderlyingToken());
        baseToken.approve(address(tokenX), 2 ** 256 - 1);
        _upgrade(_operator);
    }

    function _upgrade(address _operator) internal {
        tokenX.upgrade(baseToken.balanceOf(address(this)));
        tokenX.transfer(
            _operator,
            (baseToken.balanceOf(address(this)) * 300) / 10000
        );
    }
}
