// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

/// @title HackerGroup contract interface.
interface IHackerGroup {
    function submitBug(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint64 _paymentChainSelector,
        address _receiver
    ) external;

}
