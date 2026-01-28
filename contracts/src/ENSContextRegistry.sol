// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ENSContextRegistry
 * @notice Stores ENS context tiers with selective disclosure
 * @dev Only stores tier levels (0-2), not raw scores for privacy
 */
contract ENSContextRegistry is Ownable {
    // Tier levels
    enum Tier {
        Standard,   // 0-799
        Trusted,    // 800-899
        Elite       // 900-1000
    }

    // User context data
    struct UserContext {
        bytes32 ensNameHash;  // Keccak256(ENS name) for privacy
        Tier tier;            // Current tier
        uint256 lastUpdate;   // Last update timestamp
        bool isActive;        // Registration status
    }

    // Mappings
    mapping(address => UserContext) public userContexts;
    mapping(bytes32 => address) public ensHashToAddress;

    // Events
    event ContextRegistered(address indexed user, bytes32 ensNameHash, Tier tier);
    event TierUpdated(address indexed user, Tier oldTier, Tier newTier);
    event ContextDeactivated(address indexed user);

    // Backend oracle address (authorized to update tiers)
    address public backendOracle;

    constructor(address initialOwner) Ownable(initialOwner) {
        backendOracle = initialOwner;
    }

    /**
     * @notice Set the backend oracle address
     * @param _oracle New oracle address
     */
    function setBackendOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        backendOracle = _oracle;
    }

    /**
     * @notice Register or update user context
     * @param user User address
     * @param ensNameHash Keccak256 hash of ENS name
     * @param tier Calculated tier
     */
    function registerContext(
        address user,
        bytes32 ensNameHash,
        Tier tier
    ) external {
        require(msg.sender == backendOracle, "Only oracle can register");
        require(user != address(0), "Invalid user address");
        require(ensNameHash != bytes32(0), "Invalid ENS hash");

        UserContext storage context = userContexts[user];
        Tier oldTier = context.tier;
        bool wasRegistered = context.isActive;

        // Update or create context
        context.ensNameHash = ensNameHash;
        context.tier = tier;
        context.lastUpdate = block.timestamp;
        context.isActive = true;

        // Update reverse mapping
        ensHashToAddress[ensNameHash] = user;

        if (wasRegistered && oldTier != tier) {
            emit TierUpdated(user, oldTier, tier);
        } else {
            emit ContextRegistered(user, ensNameHash, tier);
        }
    }

    /**
     * @notice Get user tier (selective disclosure - no raw score)
     * @param user User address
     * @return tier User's current tier
     */
    function getUserTier(address user) external view returns (Tier) {
        require(userContexts[user].isActive, "User not registered");
        return userContexts[user].tier;
    }

    /**
     * @notice Check if user has minimum tier
     * @param user User address
     * @param minTier Minimum required tier
     * @return bool Whether user meets requirement
     */
    function hasMinimumTier(address user, Tier minTier) external view returns (bool) {
        if (!userContexts[user].isActive) {
            return false;
        }
        return userContexts[user].tier >= minTier;
    }

    /**
     * @notice Get user by ENS hash
     * @param ensNameHash ENS name hash
     * @return address User address
     */
    function getUserByENSHash(bytes32 ensNameHash) external view returns (address) {
        return ensHashToAddress[ensNameHash];
    }

    /**
     * @notice Deactivate user context
     * @param user User address
     */
    function deactivateContext(address user) external {
        require(
            msg.sender == backendOracle || msg.sender == user,
            "Unauthorized"
        );
        userContexts[user].isActive = false;
        emit ContextDeactivated(user);
    }

    /**
     * @notice Check if user is registered and active
     * @param user User address
     * @return bool Registration status
     */
    function isUserRegistered(address user) external view returns (bool) {
        return userContexts[user].isActive;
    }
}
