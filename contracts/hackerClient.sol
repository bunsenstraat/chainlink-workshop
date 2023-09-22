// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import {ISemaphore} from "semaphore/contracts/interfaces/ISemaphore.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IHackerGroup} from "contracts/IHackerGroup.sol";

contract HackerClient is OwnerIsCreator, IHackerGroup {
    uint64 destinationChainSelector; // The chain selector of the destination chain.
    IHackerGroup hackgergroup;

    constructor(address _hackergroup, uint64 _destinationChainSelector) {
        destinationChainSelector = _destinationChainSelector;
        hackgergroup = IHackerGroup(_hackergroup);
    }

    function submitBug(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint64 _paymentChainSelector,
        address _receiver
    ) external override {
        hackgergroup.submitBug(groupId, merkleTreeRoot, signal, nullifierHash, externalNullifier, proof, _paymentChainSelector, _receiver);
    }

    function approveBug(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint64 _paymentChainSelector,
        address _receiver
    ) external override {
        hackgergroup.approveBug(groupId, merkleTreeRoot, signal, nullifierHash, externalNullifier, proof, _paymentChainSelector, _receiver);
    }

    function rejectBug(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint64 _paymentChainSelector,
        address _receiver
    ) external override {
        hackgergroup.approveBug(groupId, merkleTreeRoot, signal, nullifierHash, externalNullifier, proof, _paymentChainSelector, _receiver);
    }
}
