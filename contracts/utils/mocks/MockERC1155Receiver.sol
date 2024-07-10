// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../interfaces/IERC1155.sol";

contract MockERC1155Receiver is IERC1155TokenReceiver {
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) public override pure returns (bytes4){
      return IERC1155TokenReceiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) public override pure returns (bytes4){
      return IERC1155TokenReceiver.onERC1155BatchReceived.selector;
    }
}