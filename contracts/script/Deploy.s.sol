// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BasketManager.sol";
import "../src/HederaConsensusLogger.sol";

/**
 * @title Deploy
 * @dev Deployment script for Hedera AI Basket System contracts
 */
contract Deploy is Script {
    BasketManager public basketManager;
    HederaConsensusLogger public consensusLogger;

    // Hedera testnet consensus topic ID (placeholder - would be actual topic ID)
    bytes32 constant CONSENSUS_TOPIC_ID =
        0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HEDERA_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Hedera Consensus Logger first
        consensusLogger = new HederaConsensusLogger(CONSENSUS_TOPIC_ID);
        console.log(
            "HederaConsensusLogger deployed at:",
            address(consensusLogger)
        );

        // Deploy Basket Manager
        basketManager = new BasketManager();
        console.log("BasketManager deployed at:", address(basketManager));

        vm.stopBroadcast();

        // Log deployment information
        console.log("\n=== Deployment Summary ===");
        console.log("BasketManager:", address(basketManager));
        console.log("HederaConsensusLogger:", address(consensusLogger));
        console.log("Consensus Topic ID:", vm.toString(CONSENSUS_TOPIC_ID));

        // Verify initial state
        console.log("\n=== Contract Verification ===");
        console.log("Basket count:", basketManager.getBasketCount());
        console.log(
            "Consensus topic set:",
            vm.toString(consensusLogger.consensusTopicId())
        );
    }
}
