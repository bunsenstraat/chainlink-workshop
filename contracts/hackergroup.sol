// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4;
import {ISemaphore} from "semaphore/contracts/interfaces/ISemaphore.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IHackerGroup} from "contracts/IHackerGroup.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";

contract HackerGroup is OwnerIsCreator, IHackerGroup, CCIPReceiver {
    ISemaphore public semaphore;
    IRouterClient router;
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); 
    enum bugState {
        NEW,
        APPROVED,
        REJECTED
    }

    struct Bugs {
        uint256 externalNullifier;
        uint64 _paymentChainSelector;
        address _receiver;
        bugState state;
        uint256 approveCount;
        uint256 rejectCount;
    }

    // Event emitted when the tokens are transferred to an account on another chain.
    event TokensTransferred(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        address token, // The token address that was transferred.
        uint256 tokenAmount, // The token amount that was transferred.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the message.
    );

    mapping(uint256 => Bugs) public bugs;

    constructor(address semaphoreAddress, address _router) CCIPReceiver(_router) {
        semaphore = ISemaphore(semaphoreAddress);
        router = IRouterClient(_router);
    }



    // the externalNullifier is the CID encoded as a bigNumber, it needs to be decoded in javascript to use it.
    // the signal signifies what we want to do:
    // 0: add a new bug
    // 1: approve the bug
    // 2: reject the bug
    function submit(
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
        if (signal == 0) {
            bugs[externalNullifier] = Bugs(externalNullifier, _paymentChainSelector, _receiver, bugState.NEW, 0, 0);
        } else if (signal == 1) {
            bugs[externalNullifier].approveCount++;
        } else if (signal == 2) {
            bugs[externalNullifier].rejectCount++;
        }
    }

    function approvals(uint256 externalNullifier) public view returns (uint256) {
        require(bugs[externalNullifier].externalNullifier > 0, "bug does not exist");
        return bugs[externalNullifier].approveCount;
    }

    function rejects(uint256 externalNullifier) public view returns (uint256) {
        require(bugs[externalNullifier].externalNullifier > 0, "bug does not exist");
        return bugs[externalNullifier].rejectCount;
    }

    function bugstate(uint256 externalNullifier) public view returns (string memory) {
        require(bugs[externalNullifier].externalNullifier > 0, "bug does not exist");
        if (bugs[externalNullifier].state == bugState.NEW) {
            return "NEW";
        }
        if (bugs[externalNullifier].state == bugState.APPROVED) {
            return "APPROVED";
        }
        if (bugs[externalNullifier].state == bugState.REJECTED) {
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

    /// handle a received message
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {}

    /// @notice Transfer tokens to receiver on the destination chain.
    /// @notice Pay in native gas such as ETH on Ethereum or MATIC on Polgon.
    /// @notice the token must be in the list of supported tokens.
    /// @notice This function can only be called by the owner.
    /// @dev Assumes your contract has sufficient native gas like ETH on Ethereum or MATIC on Polygon.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _receiver The address of the recipient on the destination blockchain.
    /// @param _token token address.
    /// @param _amount token amount.
    /// @return messageId The ID of the message that was sent.
    function transferTokensPayNative(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    ) external onlyOwner returns (bytes32 messageId) {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        // address(0) means fees are paid in native gas
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(_receiver, _token, _amount, address(0));

        // Get the fee required to send the message
        uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

        if (fees > address(this).balance) revert NotEnoughBalance(address(this).balance, fees);

        // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
        IERC20(_token).approve(address(router), _amount);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend{value: fees}(_destinationChainSelector, evm2AnyMessage);

        // Emit an event with message details
        emit TokensTransferred(messageId, _destinationChainSelector, _receiver, _token, _amount, address(0), fees);

        // Return the message ID
        return messageId;
    }

    /// @notice Construct a CCIP message.
    /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for tokens transfer.
    /// @param _receiver The address of the receiver.
    /// @param _token The token to be transferred.
    /// @param _amount The amount of the token to be transferred.
    /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
    /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount = Client.EVMTokenAmount({token: _token, amount: _amount});
        tokenAmounts[0] = tokenAmount;
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver), // ABI-encoded receiver address
            data: "", // No data
            tokenAmounts: tokenAmounts, // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit to 0 as we are not sending any data and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 0, strict: false})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: _feeTokenAddress
        });
        return evm2AnyMessage;
    }
}
