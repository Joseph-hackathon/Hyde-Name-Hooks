import { ethers } from 'ethers';

const REGISTRY_ABI = [
    "function registerContext(address user, bytes32 ensNameHash, uint8 tier) external",
    "function getUserTier(address user) external view returns (uint8)",
    "function hasMinimumTier(address user, uint8 minTier) external view returns (bool)",
    "function isUserRegistered(address user) external view returns (bool)",
];

/**
 * Service for interacting with ENSContextRegistry contract
 */
export class ContractService {
    private provider: ethers.Provider;
    private signer: ethers.Wallet;
    private registry: ethers.Contract;

    constructor(
        rpcUrl: string,
        privateKey: string,
        registryAddress: string
    ) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers.Wallet(privateKey, this.provider);
        this.registry = new ethers.Contract(
            registryAddress,
            REGISTRY_ABI,
            this.signer
        );
    }

    /**
     * Register user context in the registry
     * @param userAddress User's Ethereum address
     * @param ensName User's ENS name
     * @param tier Calculated tier (0=Standard, 1=Trusted, 2=Elite)
     */
    async registerUserContext(
        userAddress: string,
        ensName: string,
        tier: number
    ): Promise<string> {
        try {
            // Hash ENS name for privacy
            const ensNameHash = ethers.keccak256(ethers.toUtf8Bytes(ensName));

            console.log(`Registering context: ${userAddress} -> ${ensName} (Tier ${tier})`);

            const tx = await this.registry.registerContext(
                userAddress,
                ensNameHash,
                tier
            );

            const receipt = await tx.wait();
            console.log(`Context registered. Tx hash: ${receipt.hash}`);

            return receipt.hash;
        } catch (error) {
            console.error('Error registering context:', error);
            throw new Error('Failed to register context on-chain');
        }
    }

    /**
     * Get user tier from registry
     * @param userAddress User's Ethereum address
     * @returns Tier (0=Standard, 1=Trusted, 2=Elite)
     */
    async getUserTier(userAddress: string): Promise<number> {
        try {
            const tier = await this.registry.getUserTier(userAddress);
            return Number(tier);
        } catch (error) {
            console.error('Error getting user tier:', error);
            throw new Error('User not registered');
        }
    }

    /**
     * Check if user is registered
     * @param userAddress User's Ethereum address
     * @returns Registration status
     */
    async isUserRegistered(userAddress: string): Promise<boolean> {
        try {
            return await this.registry.isUserRegistered(userAddress);
        } catch (error) {
            console.error('Error checking registration:', error);
            return false;
        }
    }

    /**
     * Check if user meets minimum tier requirement
     * @param userAddress User's Ethereum address
     * @param minTier Minimum required tier
     * @returns Whether user meets requirement
     */
    async hasMinimumTier(
        userAddress: string,
        minTier: number
    ): Promise<boolean> {
        try {
            return await this.registry.hasMinimumTier(userAddress, minTier);
        } catch (error) {
            console.error('Error checking tier:', error);
            return false;
        }
    }
}
