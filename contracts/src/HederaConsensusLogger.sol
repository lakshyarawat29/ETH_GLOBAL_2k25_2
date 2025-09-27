// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HederaConsensusLogger
 * @dev Logs AI decisions and rebalancing events to Hedera Consensus Service
 * @notice This contract interfaces with Hedera Consensus Service for immutable logging
 */
contract HederaConsensusLogger is Ownable {
    // Event types for logging
    enum EventType {
        AI_DECISION, // 0: AI basket recommendation
        REBALANCING_START, // 1: Rebalancing execution started
        REBALANCING_SUCCESS, // 2: Rebalancing completed successfully
        REBALANCING_FAILED, // 3: Rebalancing failed
        YIELD_UPDATE, // 4: Yield data updated
        USER_REGISTRATION // 5: User registered
    }

    // Log entry structure
    struct LogEntry {
        EventType eventType;
        address user;
        uint256 basketId;
        uint256 timestamp;
        bytes32 dataHash; // Hash of additional data
        string message;
    }

    // Consensus Service topic ID (set during deployment)
    bytes32 public consensusTopicId;

    // Events
    event LogSubmitted(
        bytes32 indexed topicId,
        EventType indexed eventType,
        address indexed user,
        uint256 timestamp
    );
    event ConsensusTopicUpdated(
        bytes32 indexed oldTopicId,
        bytes32 indexed newTopicId
    );

    // Log entries storage (for verification purposes)
    mapping(bytes32 => LogEntry) public logEntries;
    mapping(address => bytes32[]) public userLogs;

    uint256 public logCount;

    constructor(bytes32 _consensusTopicId) Ownable(msg.sender) {
        consensusTopicId = _consensusTopicId;
    }

    /**
     * @dev Submit a log entry to Hedera Consensus Service
     * @param eventType Type of event being logged
     * @param user User address (if applicable)
     * @param basketId Basket ID (if applicable)
     * @param dataHash Hash of additional data
     * @param message Human-readable message
     */
    function submitLog(
        EventType eventType,
        address user,
        uint256 basketId,
        bytes32 dataHash,
        string memory message
    ) internal {
        bytes32 logId = keccak256(
            abi.encodePacked(
                eventType,
                user,
                basketId,
                block.timestamp,
                dataHash,
                message
            )
        );

        LogEntry memory entry = LogEntry({
            eventType: eventType,
            user: user,
            basketId: basketId,
            timestamp: block.timestamp,
            dataHash: dataHash,
            message: message
        });

        logEntries[logId] = entry;
        userLogs[user].push(logId);
        logCount++;

        // In a real implementation, this would submit to Hedera Consensus Service
        // For now, we emit an event that represents the consensus submission
        emit LogSubmitted(consensusTopicId, eventType, user, block.timestamp);
    }

    /**
     * @dev Log AI decision with basket recommendation
     * @param user User address
     * @param recommendedBasket Recommended basket ID
     * @param confidence Confidence score (0-100)
     * @param reason AI reasoning
     */
    function logAIDecision(
        address user,
        uint256 recommendedBasket,
        uint256 confidence,
        string memory reason
    ) external onlyOwner {
        bytes32 dataHash = keccak256(
            abi.encodePacked(recommendedBasket, confidence, reason)
        );

        string memory message = string(
            abi.encodePacked(
                "AI Decision: Recommended basket ",
                _uintToString(recommendedBasket),
                " with confidence ",
                _uintToString(confidence),
                "%: ",
                reason
            )
        );

        submitLog(
            EventType.AI_DECISION,
            user,
            recommendedBasket,
            dataHash,
            message
        );
    }

    /**
     * @dev Log rebalancing execution start
     * @param user User address
     * @param fromBasket Source basket ID
     * @param toBasket Target basket ID
     * @param swapData Hash of swap transaction data
     */
    function logRebalancingStart(
        address user,
        uint256 fromBasket,
        uint256 toBasket,
        bytes32 swapData
    ) external onlyOwner {
        bytes32 dataHash = keccak256(
            abi.encodePacked(fromBasket, toBasket, swapData)
        );

        string memory message = string(
            abi.encodePacked(
                "Rebalancing started: Basket ",
                _uintToString(fromBasket),
                " -> ",
                _uintToString(toBasket)
            )
        );

        submitLog(
            EventType.REBALANCING_START,
            user,
            toBasket,
            dataHash,
            message
        );
    }

    /**
     * @dev Log successful rebalancing completion
     * @param user User address
     * @param toBasket Target basket ID
     * @param txHash Transaction hash
     * @param gasUsed Gas used in transaction
     */
    function logRebalancingSuccess(
        address user,
        uint256 toBasket,
        bytes32 txHash,
        uint256 gasUsed
    ) external onlyOwner {
        bytes32 dataHash = keccak256(abi.encodePacked(txHash, gasUsed));

        string memory message = string(
            abi.encodePacked(
                "Rebalancing successful: Moved to basket ",
                _uintToString(toBasket),
                " | Gas: ",
                _uintToString(gasUsed)
            )
        );

        submitLog(
            EventType.REBALANCING_SUCCESS,
            user,
            toBasket,
            dataHash,
            message
        );
    }

    /**
     * @dev Log failed rebalancing
     * @param user User address
     * @param toBasket Target basket ID
     * @param errorCode Error code
     * @param errorMessage Error message
     */
    function logRebalancingFailed(
        address user,
        uint256 toBasket,
        uint256 errorCode,
        string memory errorMessage
    ) external onlyOwner {
        bytes32 dataHash = keccak256(abi.encodePacked(errorCode, errorMessage));

        string memory message = string(
            abi.encodePacked(
                "Rebalancing failed: Target basket ",
                _uintToString(toBasket),
                " | Error ",
                _uintToString(errorCode),
                ": ",
                errorMessage
            )
        );

        submitLog(
            EventType.REBALANCING_FAILED,
            user,
            toBasket,
            dataHash,
            message
        );
    }

    /**
     * @dev Log yield data update
     * @param basketId Basket ID
     * @param yieldData Hash of yield data
     * @param averageYield Average yield percentage
     */
    function logYieldUpdate(
        uint256 basketId,
        bytes32 yieldData,
        uint256 averageYield
    ) external onlyOwner {
        bytes32 dataHash = keccak256(abi.encodePacked(yieldData, averageYield));

        string memory message = string(
            abi.encodePacked(
                "Yield updated: Basket ",
                _uintToString(basketId),
                " average yield ",
                _uintToString(averageYield),
                " bps"
            )
        );

        submitLog(
            EventType.YIELD_UPDATE,
            address(0),
            basketId,
            dataHash,
            message
        );
    }

    /**
     * @dev Log user registration
     * @param user User address
     * @param basketId Selected basket ID
     * @param riskProfile Risk profile string
     */
    function logUserRegistration(
        address user,
        uint256 basketId,
        string memory riskProfile
    ) external onlyOwner {
        bytes32 dataHash = keccak256(
            abi.encodePacked(user, basketId, riskProfile)
        );

        string memory message = string(
            abi.encodePacked(
                "User registered: ",
                riskProfile,
                " risk profile, basket ",
                _uintToString(basketId)
            )
        );

        submitLog(
            EventType.USER_REGISTRATION,
            user,
            basketId,
            dataHash,
            message
        );
    }

    /**
     * @dev Update consensus topic ID
     * @param newTopicId New Hedera Consensus Service topic ID
     */
    function updateConsensusTopic(bytes32 newTopicId) external onlyOwner {
        bytes32 oldTopicId = consensusTopicId;
        consensusTopicId = newTopicId;

        emit ConsensusTopicUpdated(oldTopicId, newTopicId);
    }

    /**
     * @dev Get log entries for a user
     * @param user User address
     * @return logIds Array of log IDs for the user
     */
    function getUserLogs(
        address user
    ) external view returns (bytes32[] memory) {
        return userLogs[user];
    }

    /**
     * @dev Get log entry details
     * @param logId Log entry ID
     * @return entry Log entry details
     */
    function getLogEntry(
        bytes32 logId
    ) external view returns (LogEntry memory) {
        return logEntries[logId];
    }

    /**
     * @dev Convert uint to string
     * @param value Uint value to convert
     * @return string String representation
     */
    function _uintToString(
        uint256 value
    ) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
