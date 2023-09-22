// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import {ISemaphore} from "semaphore/contracts/interfaces/ISemaphore.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IHackerGroup} from "contracts/IHackerGroup.sol";

contract HackerGroup is OwnerIsCreator, IHackerGroup {
    ISemaphore public semaphore;

    enum bugState {
        NEW,
        APPROVED,
        REJECTED
    }

    struct Bugs {
        uint256 signal;
        uint64 _paymentChainSelector;
        address _receiver;
        bugState state;
        uint256 approveCount;
        uint256 rejectCount;
    }

    mapping(uint256 => Bugs) public bugs;

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
    ) external override {
        semaphore.verifyProof(groupId, merkleTreeRoot, signal, nullifierHash, externalNullifier, proof);
        bugs[signal] = Bugs(signal, _paymentChainSelector, _receiver, bugState.NEW, 0, 0);
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
        // semaphore.verifyProof(
        //     groupId,
        //     merkleTreeRoot,
        //     signal,
        //     nullifierHash,
        //     externalNullifier,
        //     proof
        // );
        bugs[signal].approveCount++;
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
        // semaphore.verifyProof(
        //     groupId,
        //     merkleTreeRoot,
        //     signal,
        //     nullifierHash,
        //     externalNullifier,
        //     proof
        // );
        bugs[signal].rejectCount++;
    }

    function approvals(uint256 signal) public view returns (uint256) {
        require(bugs[signal].signal > 0, "bug does not exist");
        return bugs[signal].approveCount;
    }

    function rejects(uint256 signal) public view returns (uint256) {
        require(bugs[signal].signal > 0, "bug does not exist");
        return bugs[signal].rejectCount;
    }

    function bugstate(uint256 signal) public view returns (string memory) {
        require(bugs[signal].signal > 0, "bug does not exist");
        if (bugs[signal].state == bugState.NEW) {
            return "NEW";
        }
        if (bugs[signal].state == bugState.APPROVED) {
            return "APPROVED";
        }
        if (bugs[signal].state == bugState.REJECTED) {
            return "REJECTED";
        }
        return "UNKNOWN";
    }

    receive() external payable {}

    function deposit() external payable {}

    function getBalance() external view returns (uint256) {
        // To access the amount of ether the contract has
        return address(this).balance;
    }
}
