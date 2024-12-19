// SPDX-License-Identifier:  MIT
pragma solidity ^0.8.23;

import './interfaces/ISpokePool.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

struct AcrossDeposit {
    address inputToken;
    address outputToken;
    uint256 inputAmount;
    uint256 outputAmount;
    uint256 destinationChainId;
    uint256 originChainId;
    uint256 depositId;
    uint32 quoteTimestamp;
    uint32 fillDeadline;
    uint32 exclusivityDeadline;
    address depositor;
    address recipient;
    address exclusiveRelayer;
    bytes message;
}

struct Execution {
    address to;
    uint256 value;
    bytes data;
}
contract RhinestoneRelayer is Ownable {
    using SafeERC20 for IERC20;

    ISpokePool public spokepool;

    constructor(address _owner) Ownable(_owner) {}

    function setSpokepool(address _spokepool) public onlyOwner {
        spokepool = ISpokePool(_spokepool);
    }

    function approveSpokepool(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) public onlyOwner {
        if (tokens.length != amounts.length) {
            revert(
                'RhinestoneRelayer: approveSpokepool: tokens and amounts length mismatch'
            );
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).approve(address(spokepool), amounts[i]);
        }
    }

    function withdrawFunds(
        address recipient,
        address token,
        uint256 amount
    ) public onlyOwner {
        if (token != address(0)) {
            IERC20(token).safeTransfer(recipient, amount);
        } else {
            payable(recipient).transfer(amount);
        }
    }

    function multiCall(Execution[] calldata executions) public onlyOwner {
        for (uint256 i = 0; i < executions.length; i++) {
            (bool success, ) = executions[i].to.call{
                value: executions[i].value
            }(executions[i].data);
            require(success, 'RhinestoneRelayer: multiCall failed');
        }
    }

    function fillBundle(
        AcrossDeposit calldata executionDeposit,
        AcrossDeposit[] calldata standardDeposits,
        uint256 repaymentChainId
    ) public onlyOwner {
        for (uint256 i = 0; i < standardDeposits.length; i++) {
            spokepool.fillV3Relay(
                V3RelayData({
                    depositor: standardDeposits[i].depositor,
                    recipient: standardDeposits[i].recipient,
                    exclusiveRelayer: standardDeposits[i].exclusiveRelayer,
                    inputToken: standardDeposits[i].inputToken,
                    outputToken: standardDeposits[i].outputToken,
                    inputAmount: standardDeposits[i].inputAmount,
                    outputAmount: standardDeposits[i].outputAmount,
                    originChainId: standardDeposits[i].originChainId,
                    depositId: standardDeposits[i].depositId,
                    fillDeadline: standardDeposits[i].fillDeadline,
                    exclusivityDeadline: standardDeposits[i]
                        .exclusivityDeadline,
                    message: standardDeposits[i].message
                }),
                repaymentChainId
            );
        }

        spokepool.fillV3Relay(
            V3RelayData({
                depositor: executionDeposit.depositor,
                recipient: executionDeposit.recipient,
                exclusiveRelayer: executionDeposit.exclusiveRelayer,
                inputToken: executionDeposit.inputToken,
                outputToken: executionDeposit.outputToken,
                inputAmount: executionDeposit.inputAmount,
                outputAmount: executionDeposit.outputAmount,
                originChainId: executionDeposit.originChainId,
                depositId: executionDeposit.depositId,
                fillDeadline: executionDeposit.fillDeadline,
                exclusivityDeadline: executionDeposit.exclusivityDeadline,
                message: executionDeposit.message
            }),
            repaymentChainId
        );
    }

    receive() external payable {}
}
