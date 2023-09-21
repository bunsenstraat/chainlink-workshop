# Solidity API

## HackerGroup

### Contract
HackerGroup : contracts/hackergroup.sol

 --- 
### Functions:
### constructor

```solidity
constructor(address _semaphoreAddress) public
```

### submitBug

```solidity
function submitBug(uint256 groupId, uint256 merkleTreeRoot, uint256 signal, uint256 nullifierHash, uint256 externalNullifier, uint256[8] proof) external
```

inherits OwnerIsCreator:
inherits ConfirmedOwner:
inherits ConfirmedOwnerWithProposal:
### transferOwnership

```solidity
function transferOwnership(address to) public
```

Allows an owner to begin transferring ownership to a new address,
pending.

### acceptOwnership

```solidity
function acceptOwnership() external
```

Allows an ownership transfer to be completed by the recipient.

### owner

```solidity
function owner() public view returns (address)
```

Get the current owner

### _validateOwnership

```solidity
function _validateOwnership() internal view
```

validate access

inherits OwnableInterface:

 --- 
### Events:
inherits OwnerIsCreator:
inherits ConfirmedOwner:
inherits ConfirmedOwnerWithProposal:
### OwnershipTransferRequested

```solidity
event OwnershipTransferRequested(address from, address to)
```

### OwnershipTransferred

```solidity
event OwnershipTransferred(address from, address to)
```

inherits OwnableInterface:

