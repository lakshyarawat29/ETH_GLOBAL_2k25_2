// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BasketManager
 * @dev Manages AI-powered yield optimization baskets with fixed allocations
 * @notice Supports Low, Medium, and High risk profiles with different asset allocations
 */
contract BasketManager is Ownable, ReentrancyGuard {
    // Risk profile enumeration
    enum RiskProfile {
        Low, // 0: Conservative allocation
        Medium, // 1: Balanced allocation
        High // 2: Aggressive allocation
    }

    // Asset structure for basket allocations
    struct Asset {
        address tokenAddress;
        string symbol;
        uint256 allocation; // Allocation in basis points (10000 = 100%)
    }

    // Basket configuration
    struct Basket {
        RiskProfile riskProfile;
        string name;
        Asset[] assets;
        bool isActive;
        uint256 totalAllocation; // Should always equal 10000 (100%)
    }

    // User registration
    struct UserProfile {
        address walletAddress;
        RiskProfile selectedBasket;
        uint256 registrationTimestamp;
        bool isRegistered;
    }

    // Events
    event UserRegistered(
        address indexed user,
        RiskProfile indexed basket,
        uint256 timestamp
    );
    event BasketUpdated(uint256 indexed basketId, string name, bool isActive);
    event AssetAddedToBasket(
        uint256 indexed basketId,
        address indexed token,
        string symbol,
        uint256 allocation
    );
    event RebalancingExecuted(
        address indexed user,
        uint256 indexed fromBasket,
        uint256 indexed toBasket,
        uint256 timestamp
    );

    // State variables
    mapping(uint256 => Basket) public baskets;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => bool) public registeredUsers;

    uint256 public constant BASIS_POINTS = 10000; // 100%
    uint256 public basketCount;

    // Supported tokens mapping
    mapping(address => bool) public supportedTokens;
    mapping(string => address) public tokenAddresses;

    constructor() Ownable(msg.sender) {
        _initializeBaskets();
        _initializeSupportedTokens();
    }

    /**
     * @dev Initialize the three risk baskets with fixed allocations
     */
    function _initializeBaskets() internal {
        // Low Risk Basket: USDC 60%, ETH 20%, BTC 20%
        baskets[0].riskProfile = RiskProfile.Low;
        baskets[0].name = "Conservative";
        baskets[0].isActive = true;
        baskets[0].totalAllocation = BASIS_POINTS;

        // Medium Risk Basket: ETH 40%, BTC 30%, SOL 20%, LINK 10%
        baskets[1].riskProfile = RiskProfile.Medium;
        baskets[1].name = "Balanced";
        baskets[1].isActive = true;
        baskets[1].totalAllocation = BASIS_POINTS;

        // High Risk Basket: SOL 40%, AVAX 30%, LINK 20%, MATIC 10%
        baskets[2].riskProfile = RiskProfile.High;
        baskets[2].name = "Aggressive";
        baskets[2].isActive = true;
        baskets[2].totalAllocation = BASIS_POINTS;

        basketCount = 3;
        
        // Initialize assets for each basket
        _initializeBasketAssets();
    }

    /**
     * @dev Initialize assets for each basket
     */
    function _initializeBasketAssets() internal {
        // Low Risk Basket: USDC 60%, ETH 20%, BTC 20%
        baskets[0].assets.push(Asset(address(0), "USDC", 6000)); // 60%
        baskets[0].assets.push(Asset(address(0), "ETH", 2000));  // 20%
        baskets[0].assets.push(Asset(address(0), "BTC", 2000));  // 20%

        // Medium Risk Basket: ETH 40%, BTC 30%, SOL 20%, LINK 10%
        baskets[1].assets.push(Asset(address(0), "ETH", 4000));  // 40%
        baskets[1].assets.push(Asset(address(0), "BTC", 3000));  // 30%
        baskets[1].assets.push(Asset(address(0), "SOL", 2000));  // 20%
        baskets[1].assets.push(Asset(address(0), "LINK", 1000)); // 10%

        // High Risk Basket: SOL 40%, AVAX 30%, LINK 20%, MATIC 10%
        baskets[2].assets.push(Asset(address(0), "SOL", 4000));  // 40%
        baskets[2].assets.push(Asset(address(0), "AVAX", 3000)); // 30%
        baskets[2].assets.push(Asset(address(0), "LINK", 2000)); // 20%
        baskets[2].assets.push(Asset(address(0), "MATIC", 1000)); // 10%
    }

    /**
     * @dev Initialize supported token addresses (placeholder addresses for Hedera testnet)
     */
    function _initializeSupportedTokens() internal {
        // Hedera testnet token addresses (these would be actual addresses in deployment)
        tokenAddresses["USDC"] = 0x0000000000000000000000000000000000000001;
        tokenAddresses["ETH"] = 0x0000000000000000000000000000000000000002;
        tokenAddresses["BTC"] = 0x0000000000000000000000000000000000000003;
        tokenAddresses["SOL"] = 0x0000000000000000000000000000000000000004;
        tokenAddresses["LINK"] = 0x0000000000000000000000000000000000000005;
        tokenAddresses["AVAX"] = 0x0000000000000000000000000000000000000006;
        tokenAddresses["MATIC"] = 0x0000000000000000000000000000000000000007;

        // Mark tokens as supported
        supportedTokens[tokenAddresses["USDC"]] = true;
        supportedTokens[tokenAddresses["ETH"]] = true;
        supportedTokens[tokenAddresses["BTC"]] = true;
        supportedTokens[tokenAddresses["SOL"]] = true;
        supportedTokens[tokenAddresses["LINK"]] = true;
        supportedTokens[tokenAddresses["AVAX"]] = true;
        supportedTokens[tokenAddresses["MATIC"]] = true;

        // Set up basket allocations
        _setupBasketAllocations();
    }

    /**
     * @dev Set up the fixed allocations for each basket
     */
    function _setupBasketAllocations() internal {
        // Low Risk: USDC 60%, ETH 20%, BTC 20%
        baskets[0].assets[0] = Asset(tokenAddresses["USDC"], "USDC", 6000);
        baskets[0].assets[1] = Asset(tokenAddresses["ETH"], "ETH", 2000);
        baskets[0].assets[2] = Asset(tokenAddresses["BTC"], "BTC", 2000);

        // Medium Risk: ETH 40%, BTC 30%, SOL 20%, LINK 10%
        baskets[1].assets[0] = Asset(tokenAddresses["ETH"], "ETH", 4000);
        baskets[1].assets[1] = Asset(tokenAddresses["BTC"], "BTC", 3000);
        baskets[1].assets[2] = Asset(tokenAddresses["SOL"], "SOL", 2000);
        baskets[1].assets[3] = Asset(tokenAddresses["LINK"], "LINK", 1000);

        // High Risk: SOL 40%, AVAX 30%, LINK 20%, MATIC 10%
        baskets[2].assets[0] = Asset(tokenAddresses["SOL"], "SOL", 4000);
        baskets[2].assets[1] = Asset(tokenAddresses["AVAX"], "AVAX", 3000);
        baskets[2].assets[2] = Asset(tokenAddresses["LINK"], "LINK", 2000);
        baskets[2].assets[3] = Asset(tokenAddresses["MATIC"], "MATIC", 1000);
    }

    /**
     * @dev Register a user with a specific risk profile basket
     * @param user The user's wallet address
     * @param basketId The basket ID (0=Low, 1=Medium, 2=High)
     */
    function registerUser(
        address user,
        uint256 basketId
    ) external onlyOwner nonReentrant {
        require(user != address(0), "Invalid user address");
        require(basketId < basketCount, "Invalid basket ID");
        require(baskets[basketId].isActive, "Basket is not active");
        require(!registeredUsers[user], "User already registered");

        userProfiles[user] = UserProfile({
            walletAddress: user,
            selectedBasket: baskets[basketId].riskProfile,
            registrationTimestamp: block.timestamp,
            isRegistered: true
        });

        registeredUsers[user] = true;

        emit UserRegistered(
            user,
            baskets[basketId].riskProfile,
            block.timestamp
        );
    }

    /**
     * @dev Get basket allocations for a specific basket
     * @param basketId The basket ID
     * @return assets Array of assets in the basket
     * @return totalAllocation Total allocation (should be 10000)
     */
    function getBasketAllocations(
        uint256 basketId
    ) external view returns (Asset[] memory assets, uint256 totalAllocation) {
        require(basketId < basketCount, "Invalid basket ID");
        return (baskets[basketId].assets, baskets[basketId].totalAllocation);
    }

    /**
     * @dev Get user's selected basket information
     * @param user The user's wallet address
     * @return userProfile User's profile information
     * @return basketInfo The basket information
     */
    function getUserBasket(
        address user
    )
        external
        view
        returns (UserProfile memory userProfile, Basket memory basketInfo)
    {
        require(registeredUsers[user], "User not registered");
        userProfile = userProfiles[user];
        basketInfo = baskets[uint256(userProfile.selectedBasket)];
    }

    /**
     * @dev Get all basket information for AI analysis
     * @return allBaskets Array of all baskets
     */
    function getAllBaskets()
        external
        view
        returns (Basket[] memory allBaskets)
    {
        allBaskets = new Basket[](basketCount);
        for (uint256 i = 0; i < basketCount; i++) {
            allBaskets[i] = baskets[i];
        }
        return allBaskets;
    }

    /**
     * @dev Update token addresses (only owner)
     * @param symbol Token symbol
     * @param newAddress New token address
     */
    function updateTokenAddress(
        string memory symbol,
        address newAddress
    ) external onlyOwner {
        require(newAddress != address(0), "Invalid token address");

        // Update mapping
        address oldAddress = tokenAddresses[symbol];
        tokenAddresses[symbol] = newAddress;

        // Update supported tokens
        supportedTokens[oldAddress] = false;
        supportedTokens[newAddress] = true;

        // Update all basket assets with this symbol
        for (uint256 i = 0; i < basketCount; i++) {
            for (uint256 j = 0; j < baskets[i].assets.length; j++) {
                if (
                    keccak256(abi.encodePacked(baskets[i].assets[j].symbol)) ==
                    keccak256(abi.encodePacked(symbol))
                ) {
                    baskets[i].assets[j].tokenAddress = newAddress;
                }
            }
        }
    }

    /**
     * @dev Execute rebalancing for a user (called by AI agent)
     * @param user User address
     * @param newBasketId New basket ID to switch to
     */
    function executeRebalancing(
        address user,
        uint256 newBasketId
    ) external onlyOwner nonReentrant {
        require(registeredUsers[user], "User not registered");
        require(newBasketId < basketCount, "Invalid basket ID");
        require(baskets[newBasketId].isActive, "Target basket is not active");

        RiskProfile oldBasket = userProfiles[user].selectedBasket;
        userProfiles[user].selectedBasket = baskets[newBasketId].riskProfile;

        emit RebalancingExecuted(
            user,
            uint256(oldBasket),
            newBasketId,
            block.timestamp
        );
    }

    /**
     * @dev Check if a user is registered
     * @param user User address
     * @return bool True if user is registered
     */
    function isUserRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }

    /**
     * @dev Get basket count
     * @return uint256 Number of baskets
     */
    function getBasketCount() external view returns (uint256) {
        return basketCount;
    }

    /**
     * @dev Get token address by symbol
     * @param symbol Token symbol
     * @return address Token address
     */
    function getTokenAddress(
        string memory symbol
    ) external view returns (address) {
        return tokenAddresses[symbol];
    }
}
