// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import 'forge-std/Test.sol';
import '../../contracts/RhinestoneRelayer.sol';
import '../../contracts/interfaces/ISpokePool.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract RhinestoneRelayerTest is Test {
    using SafeERC20 for ERC20;

    RhinestoneRelayer relayer;
    ISpokePool spokepool;
    MockERC20 token;

    address owner = address(1);
    address nonOwner = address(2);
    address recipient = address(3);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy the RhinestoneRelayer contract
        relayer = new RhinestoneRelayer(address(owner));

        // Mock the ISpokePool and ERC20 token
        spokepool = ISpokePool(address(new MockSpokePool()));
        token = new MockERC20('Test Token', 'TT', 18);

        relayer.setSpokepool(address(spokepool));

        vm.stopPrank();
    }

    function testSetSpokepool() public {
        vm.startPrank(owner);

        address newSpokepool = address(new MockSpokePool());
        relayer.setSpokepool(newSpokepool);

        assertEq(address(relayer.spokepool()), newSpokepool);

        vm.stopPrank();
    }

    function testWithdrawFundsERC20() public {
        vm.startPrank(owner);

        uint256 amount = 100 * 10 ** 18;
        token.mint(address(relayer), amount);

        uint256 relayerBalanceBefore = token.balanceOf(address(relayer));
        uint256 recipientBalanceBefore = token.balanceOf(recipient);

        relayer.withdrawFunds(recipient, address(token), amount);

        uint256 relayerBalanceAfter = token.balanceOf(address(relayer));
        uint256 recipientBalanceAfter = token.balanceOf(recipient);

        assertEq(relayerBalanceBefore - amount, relayerBalanceAfter);
        assertEq(recipientBalanceBefore + amount, recipientBalanceAfter);

        vm.stopPrank();
    }

    function testSendEther() public {
        vm.startPrank(owner);
        vm.deal(address(owner), 1 ether);

        uint256 relayerBalanceBefore = address(relayer).balance;

        address(relayer).call{ value: 1 ether - 5000 }('');

        payable(address(relayer)).transfer(5000);

        assertEq(address(relayer).balance, relayerBalanceBefore + 1 ether);

        vm.stopPrank();
    }

    function testWithdrawFundsETH() public {
        vm.deal(address(relayer), 1 ether);
        vm.startPrank(owner);

        uint256 relayerBalanceBefore = address(relayer).balance;
        uint256 recipientBalanceBefore = recipient.balance;

        relayer.withdrawFunds(recipient, address(0), 1 ether);

        uint256 relayerBalanceAfter = address(relayer).balance;
        uint256 recipientBalanceAfter = recipient.balance;

        assertEq(relayerBalanceBefore - 1 ether, relayerBalanceAfter);
        assertEq(recipientBalanceBefore + 1 ether, recipientBalanceAfter);

        vm.stopPrank();
    }

    function testMultiCall() public {
        vm.startPrank(owner);

        address target = address(new MockTarget());
        Execution[] memory executions = new Execution[](2);

        executions[0] = Execution({
            to: target,
            value: 0,
            data: abi.encodeWithSignature('testFunction(uint256)', 42)
        });

        executions[1] = Execution({
            to: target,
            value: 0,
            data: abi.encodeWithSignature('testFunction(uint256)', 100)
        });

        relayer.multiCall(executions);

        MockTarget targetContract = MockTarget(target);
        assertEq(targetContract.lastValue(), 100); // Ensure last call executed

        vm.stopPrank();
    }

    function testFillBundle() public {
        vm.startPrank(owner);

        AcrossDeposit memory executionDeposit = AcrossDeposit({
            inputToken: address(token),
            outputToken: address(token),
            inputAmount: 100,
            outputAmount: 100,
            destinationChainId: 1,
            originChainId: 2,
            depositId: 1,
            quoteTimestamp: 0,
            fillDeadline: 1000000000,
            exclusivityDeadline: 1000000000,
            depositor: owner,
            recipient: recipient,
            exclusiveRelayer: address(0),
            message: ''
        });

        AcrossDeposit[] memory standardDeposits = new AcrossDeposit[](1);
        standardDeposits[0] = executionDeposit;

        uint256 repaymentChainId = 1;

        relayer.fillBundle(
            executionDeposit,
            standardDeposits,
            repaymentChainId
        );

        // MockSpokePool should log calls to `fillV3Relay`.
        MockSpokePool mockSpokePool = MockSpokePool(address(spokepool));
        assertEq(mockSpokePool.callsMade(), 2); // One for each deposit

        vm.stopPrank();
    }

    function testApproveSpokepool() public {
        vm.startPrank(owner);

        uint256 amount = 100 * 10 ** 18;
        token.mint(address(relayer), amount);

        address[] memory tokens = new address[](1);
        tokens[0] = address(token);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        relayer.approveSpokepool(tokens, amounts);

        assertEq(token.allowance(address(relayer), address(spokepool)), amount);

        vm.stopPrank();
    }
}

contract MockSpokePool is ISpokePool {
    uint256 public callsMade;

    function fillV3Relay(V3RelayData calldata, uint256) external override {
        callsMade++;
    }

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
    ) external payable override {}

    function wrappedNativeToken() external view override returns (address) {
        return address(0);
    }
}

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract MockTarget {
    uint256 public lastValue;

    function testFunction(uint256 value) public {
        lastValue = value;
    }
}
