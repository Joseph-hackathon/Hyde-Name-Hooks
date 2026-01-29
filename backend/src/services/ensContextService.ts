import { ethers } from 'ethers';

/**
 * ENS Context Scoring Service
 * Calculates user tier based on on-chain activity
 */

export enum Tier {
    Standard = 0,
    Trusted = 1,
    Elite = 2,
}

export interface ContextScore {
    totalScore: number;
    tier: Tier;
    breakdown: {
        transactionHistory: number;
        tokenHoldings: number;
        defiActivity: number;
        daoParticipation: number;
    };
}

export class ENSContextService {
    private provider: ethers.Provider;

    constructor(rpcUrl: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    private static ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
    ];

    private getScoreTokens(): string[] {
        const raw = process.env.SCORE_TOKEN_ADDRESSES || '';
        return raw
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
    }

    /**
     * Calculate context score for an ENS name/address
     * @param address Ethereum address
     * @returns Context score and tier
     */
    async calculateContextScore(address: string): Promise<ContextScore> {
        try {
            const ensName = await this.provider.lookupAddress(address);

            // Score components
            const transactionHistory = await this.scoreTransactionHistory(address);
            const tokenHoldings = await this.scoreTokenHoldings(address);
            const defiActivity = await this.scoreDefiActivity(address);
            const daoParticipation = await this.scoreDaoParticipation(address, ensName);

            const totalScore = Math.min(
                transactionHistory +
                tokenHoldings +
                defiActivity +
                daoParticipation,
                1000
            );

            const tier = this.calculateTier(totalScore);

            return {
                totalScore,
                tier,
                breakdown: {
                    transactionHistory,
                    tokenHoldings,
                    defiActivity,
                    daoParticipation,
                },
            };
        } catch (error) {
            console.error('Error calculating context score:', error);
            // Return default score on error
            return this.getDefaultScore();
        }
    }

    /**
     * Score based on transaction history (0-300 points)
     */
    private async scoreTransactionHistory(address: string): Promise<number> {
        try {
            const txCount = await this.provider.getTransactionCount(address);
            const balance = await this.provider.getBalance(address);

            // Transaction count scoring (0-200)
            let txScore = 0;
            if (txCount > 1000) txScore = 200;
            else if (txCount > 500) txScore = 150;
            else if (txCount > 100) txScore = 100;
            else if (txCount > 50) txScore = 50;
            else txScore = Math.min(txCount, 50);

            // Balance scoring (0-100)
            const ethBalance = parseFloat(ethers.formatEther(balance));
            let balanceScore = 0;
            if (ethBalance > 10) balanceScore = 100;
            else if (ethBalance > 5) balanceScore = 75;
            else if (ethBalance > 1) balanceScore = 50;
            else if (ethBalance > 0.1) balanceScore = 25;
            else balanceScore = Math.floor(ethBalance * 250);

            return Math.min(txScore + balanceScore, 300);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Score based on token holdings (0-300 points)
     * Reads ERC20 balances from onchain RPC for configured token list.
     */
    private async scoreTokenHoldings(address: string): Promise<number> {
        try {
            const tokens = this.getScoreTokens();
            if (tokens.length === 0) return 0;

            const scores = await Promise.all(tokens.map(async (token) => {
                try {
                    const contract = new ethers.Contract(
                        token,
                        ENSContextService.ERC20_ABI,
                        this.provider
                    );
                    const [balance, decimals] = await Promise.all([
                        contract.balanceOf(address),
                        contract.decimals(),
                    ]);
                    const units = Number(ethers.formatUnits(balance, decimals));
                    if (units >= 1000) return 100;
                    if (units >= 100) return 75;
                    if (units >= 10) return 50;
                    if (units >= 1) return 25;
                    return units > 0 ? 10 : 0;
                } catch {
                    return 0;
                }
            }));

            const total = scores.reduce((sum, value) => sum + value, 0 as number);
            return Math.min(total, 300);
        } catch {
            return 0;
        }
    }

    /**
     * Score based on DeFi activity (0-200 points)
     * In production: analyze interaction with DeFi protocols
     */
    private async scoreDefiActivity(address: string): Promise<number> {
        const txCount = await this.provider.getTransactionCount(address);

        // Heuristic: more transactions likely means DeFi activity
        if (txCount > 500) return 200;
        if (txCount > 200) return 150;
        if (txCount > 100) return 100;
        if (txCount > 50) return 50;

        return Math.min(txCount, 50);
    }

    /**
     * Score based on DAO participation (0-200 points)
     */
    private async scoreDaoParticipation(
        address: string,
        ensName: string | null
    ): Promise<number> {
        let score = 0;

        // ENS ownership bonus
        if (ensName) {
            score += 100;
        }

        // Additional heuristics for DAO participation
        // In production: query Snapshot, Tally, governance contracts
        const txCount = await this.provider.getTransactionCount(address);

        if (txCount > 200) score += 100;
        else if (txCount > 100) score += 50;
        else if (txCount > 50) score += 25;

        return Math.min(score, 200);
    }

    /**
     * Calculate tier from total score
     */
    private calculateTier(score: number): Tier {
        if (score >= 900) return Tier.Elite;
        if (score >= 800) return Tier.Trusted;
        return Tier.Standard;
    }

    /**
     * Default score for errors
     */
    private getDefaultScore(): ContextScore {
        return {
            totalScore: 0,
            tier: Tier.Standard,
            breakdown: {
                transactionHistory: 0,
                tokenHoldings: 0,
                defiActivity: 0,
                daoParticipation: 0,
            },
        };
    }

    /**
     * Verify ENS name ownership
     */
    async verifyENSOwnership(ensName: string, address: string): Promise<boolean> {
        try {
            const resolvedAddress = await this.provider.resolveName(ensName);
            return resolvedAddress?.toLowerCase() === address.toLowerCase();
        } catch (error) {
            return false;
        }
    }

    /**
     * Get ENS name for address
     */
    async getENSName(address: string): Promise<string | null> {
        try {
            return await this.provider.lookupAddress(address);
        } catch (error) {
            return null;
        }
    }
}
