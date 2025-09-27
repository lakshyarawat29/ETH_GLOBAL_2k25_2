// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/BasketManager.sol";
import "../src/HederaConsensusLogger.sol";

contract BasketManagerTest is Test {
    BasketManager public basketManager;
    HederaConsensusLogger public consensusLogger;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    // Mock token addresses for testing
    address constant USDC = address(0x1001);
    address constant ETH = address(0x1002);
    address constant BTC = address(0x1003);
    address constant SOL = address(0x1004);
    address constant LINK = address(0x1005);
    address constant AVAX = address(0x1006);
    address constant MATIC = address(0x1007);

    bytes32 constant CONSENSUS_TOPIC_ID =
        0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy contracts
        consensusLogger = new HederaConsensusLogger(CONSENSUS_TOPIC_ID);
        basketManager = new BasketManager();

        vm.stopPrank();
    }

    function testInitialization() public {
        // Test basket count
        assertEq(basketManager.getBasketCount(), 3);

        // Test basket names and risk profiles
        (
            BasketManager.Asset[] memory lowAssets,
            uint256 lowTotal
        ) = basketManager.getBasketAllocations(0);
        (
            BasketManager.Asset[] memory medAssets,
            uint256 medTotal
        ) = basketManager.getBasketAllocations(1);
        (
            BasketManager.Asset[] memory highAssets,
            uint256 highTotal
        ) = basketManager.getBasketAllocations(2);

        // Verify total allocations
        assertEq(lowTotal, 10000);
        assertEq(medTotal, 10000);
        assertEq(highTotal, 10000);

        // Verify asset counts
        assertEq(lowAssets.length, 3);
        assertEq(medAssets.length, 4);
        assertEq(highAssets.length, 4);

        // Verify low risk basket allocations (USDC 60%, ETH 20%, BTC 20%)
        assertEq(lowAssets[0].allocation, 6000);
        assertEq(lowAssets[1].allocation, 2000);
        assertEq(lowAssets[2].allocation, 2000);

        // Verify medium risk basket allocations (ETH 40%, BTC 30%, SOL 20%, LINK 10%)
        assertEq(medAssets[0].allocation, 4000);
        assertEq(medAssets[1].allocation, 3000);
        assertEq(medAssets[2].allocation, 2000);
        assertEq(medAssets[3].allocation, 1000);

        // Verify high risk basket allocations (SOL 40%, AVAX 30%, LINK 20%, MATIC 10%)
        assertEq(highAssets[0].allocation, 4000);
        assertEq(highAssets[1].allocation, 3000);
        assertEq(highAssets[2].allocation, 2000);
        assertEq(highAssets[3].allocation, 1000);
    }

    function testUserRegistration() public {
        vm.startPrank(owner);

        // Register user1 with low risk basket
        basketManager.registerUser(user1, 0);

        // Verify registration
        assertTrue(basketManager.isUserRegistered(user1));
        (
            BasketManager.UserProfile memory profile,
            BasketManager.Basket memory basket
        ) = basketManager.getUserBasket(user1);

        assertEq(profile.walletAddress, user1);
        assertEq(uint256(profile.selectedBasket), 0); // Low risk
        assertTrue(profile.isRegistered);

        vm.stopPrank();
    }

    function testUserRegistrationFailures() public {
        vm.startPrank(owner);

        // Test invalid basket ID
        vm.expectRevert("Invalid basket ID");
        basketManager.registerUser(user1, 10);

        // Register user1 first time
        basketManager.registerUser(user1, 0);

        // Test duplicate registration
        vm.expectRevert("User already registered");
        basketManager.registerUser(user1, 1);

        // Test zero address
        vm.expectRevert("Invalid user address");
        basketManager.registerUser(address(0), 0);

        vm.stopPrank();
    }

    function testRebalancing() public {
        vm.startPrank(owner);

        // Register user1 with low risk basket
        basketManager.registerUser(user1, 0);

        // Execute rebalancing to medium risk basket
        basketManager.executeRebalancing(user1, 1);

        // Verify rebalancing
        (, BasketManager.Basket memory basket) = basketManager.getUserBasket(
            user1
        );
        assertEq(uint256(basket.riskProfile), 1); // Medium risk

        vm.stopPrank();
    }

    function testTokenAddressUpdate() public {
        vm.startPrank(owner);

        address newUSDC = address(0x2001);

        // Update USDC address
        basketManager.updateTokenAddress("USDC", newUSDC);

        // Verify update
        assertEq(basketManager.getTokenAddress("USDC"), newUSDC);
        assertTrue(basketManager.supportedTokens(newUSDC));
        assertFalse(basketManager.supportedTokens(USDC));

        // Verify basket assets updated
        (BasketManager.Asset[] memory assets, ) = basketManager
            .getBasketAllocations(0);
        assertEq(assets[0].tokenAddress, newUSDC);

        vm.stopPrank();
    }

    function testConsensusLogging() public {
        vm.startPrank(owner);

        // Log AI decision
        consensusLogger.logAIDecision(
            user1,
            1, // Medium risk basket
            85, // 85% confidence
            "Market conditions favor balanced allocation"
        );

        // Log rebalancing start
        consensusLogger.logRebalancingStart(
            user1,
            0, // From low risk
            1, // To medium risk
            keccak256("swap_data")
        );

        // Log successful completion
        consensusLogger.logRebalancingSuccess(
            user1,
            1,
            keccak256("tx_hash"),
            150000
        );

        // Verify logs exist
        bytes32[] memory userLogs = consensusLogger.getUserLogs(user1);
        assertEq(userLogs.length, 3);

        vm.stopPrank();
    }

    function testOnlyOwnerModifiers() public {
        vm.startPrank(user1);

        // Test registerUser only owner
        vm.expectRevert();
        basketManager.registerUser(user2, 0);

        // Test executeRebalancing only owner
        vm.expectRevert();
        basketManager.executeRebalancing(user2, 1);

        // Test updateTokenAddress only owner
        vm.expectRevert();
        basketManager.updateTokenAddress("USDC", address(0x2001));

        vm.stopPrank();
    }

    function testGetAllBaskets() public {
        BasketManager.Basket[] memory allBaskets = basketManager
            .getAllBaskets();

        assertEq(allBaskets.length, 3);

        // Verify basket names
        assertEq(
            keccak256(abi.encodePacked(allBaskets[0].name)),
            keccak256(abi.encodePacked("Conservative"))
        );
        assertEq(
            keccak256(abi.encodePacked(allBaskets[1].name)),
            keccak256(abi.encodePacked("Balanced"))
        );
        assertEq(
            keccak256(abi.encodePacked(allBaskets[2].name)),
            keccak256(abi.encodePacked("Aggressive"))
        );

        // Verify risk profiles
        assertEq(uint256(allBaskets[0].riskProfile), 0); // Low
        assertEq(uint256(allBaskets[1].riskProfile), 1); // Medium
        assertEq(uint256(allBaskets[2].riskProfile), 2); // High
    }
}
