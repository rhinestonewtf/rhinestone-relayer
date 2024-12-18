// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

struct V3RelayData {
    // The address that made the deposit on the origin chain.
    address depositor;
    // The recipient address on the destination chain.
    address recipient;
    // This is the exclusive relayer who can fill the deposit before the exclusivity deadline.
    address exclusiveRelayer;
    // Token that is deposited on origin chain by depositor.
    address inputToken;
    // Token that is received on destination chain by recipient.
    address outputToken;
    // The amount of input token deposited by depositor.
    uint256 inputAmount;
    // The amount of output token to be received by recipient.
    uint256 outputAmount;
    // Origin chain id.
    uint256 originChainId;
    // The id uniquely identifying this deposit on the origin chain.
    uint256 depositId;
    // The timestamp on the destination chain after which this deposit can no longer be filled.
    uint32 fillDeadline;
    // The timestamp on the destination chain after which any relayer can fill the deposit.
    uint32 exclusivityDeadline;
    // Data that is forwarded to the recipient.
    bytes message;
}

interface ISpokePool {
    function unsafeDepositV3(
        address depositor,
        address recipient,
        address inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 destinationChainId,
        address exclusiveRelayer,
        uint256 depositNonce,
        uint32 quoteTimestamp,
        uint32 fillDeadline,
        uint32 exclusivityParameter,
        bytes calldata message
    ) external payable;

    function fillV3Relay(
        V3RelayData calldata relayData,
        uint256 repaymentChainId
    ) external;

    function wrappedNativeToken() external view returns (address);
}
