// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BasketManager.sol";
import "../src/HederaConsensusLogger.sol";

/**
 * @title DeployAndVerify
 * @dev Deployment and verification script for Hedera AI Basket System
 */
contract DeployAndVerify is Script {
    BasketManager public basketManager;
    HederaConsensusLogger public consensusLogger;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HEDERA_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Hedera Consensus Logger first
        consensusLogger = new HederaConsensusLogger(0x0); // Will be updated after topic creation
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
        console.log("Network: Hedera Testnet");
        console.log("Deployer:", deployer);
        console.log("BasketManager:", address(basketManager));
        console.log("HederaConsensusLogger:", address(consensusLogger));

        // Write addresses to file for backend use
        string memory addressesJson = string(
            abi.encodePacked(
                "{\n",
                '  "basketManager": "',
                vm.toString(address(basketManager)),
                '",\n',
                '  "consensusLogger": "',
                vm.toString(address(consensusLogger)),
                '",\n',
                '  "deployer": "',
                vm.toString(deployer),
                '",\n',
                '  "network": "hedera-testnet",\n',
                '  "timestamp": "',
                vm.toString(block.timestamp),
                '"\n',
                "}"
            )
        );

        vm.writeFile("./deployment-addresses.json", addressesJson);
        console.log(
            "\nDeployment addresses saved to deployment-addresses.json"
        );

        // Verify contracts (if verification is available)
        console.log("\n=== Verification ===");
        console.log("To verify contracts on Hashscan:");
        console.log("1. BasketManager:", address(basketManager));
        console.log("2. HederaConsensusLogger:", address(consensusLogger));

        // Test basic functionality
        console.log("\n=== Contract Testing ===");
        console.log("Basket count:", basketManager.getBasketCount());
        console.log(
            "Consensus logger initialized:",
            address(consensusLogger) != address(0)
        );

        console.log("\n=== Next Steps ===");
        console.log("1. Update .env with deployed contract addresses");
        console.log("2. Create Hedera Consensus Service topic");
        console.log("3. Update consensus logger with topic ID");
        console.log("4. Start backend services");
    }
}
