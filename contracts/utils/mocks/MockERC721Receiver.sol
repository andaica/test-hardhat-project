// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../interfaces/IERC721.sol";

contract MockERC721Receiver is IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public override pure returns (bytes4){
      return IERC721Receiver.onERC721Received.selector;
    }
}