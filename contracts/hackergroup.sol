// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import {ISemaphore} from "semaphore/contracts/interfaces/ISemaphore.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";

contract HackerGroup is OwnerIsCreator {
    ISemaphore semaphore;

    constructor(address _semaphoreAddress) {
        semaphore = ISemaphore(_semaphoreAddress);
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
    ) external {
        semaphore.verifyProof(
            groupId,
            merkleTreeRoot,
            signal,
            nullifierHash,
            externalNullifier,
            proof
        );
    }

    function voteOnBug(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint64 _paymentChainSelector,
        address _receiver
    ) external {
        semaphore.verifyProof(
            groupId,
            merkleTreeRoot,
            signal,
            nullifierHash,
            externalNullifier,
            proof
        );
    }
}
