export const CHAINS = {
    sepolia: {
        id: 11155111,
        name: "Sepolia",
        rpcUrl: "https://sepolia.infura.io/v3/",
        blockExplorer: "https://sepolia.etherscan.io",
        contracts: {
            registry: "0x00427E39E353182d5595F8762Aa3559514615eCe",
            hook: "0x12a20919684Fe8C1625CCC816bD0e6801C49d371",
        },
    },
    baseSepolia: {
        id: 84532,
        name: "Base Sepolia",
        rpcUrl: "https://base-sepolia.g.alchemy.com/v2/BU56jBVBvxunrNMtZ1KIY",
        blockExplorer: "https://sepolia.basescan.org",
        contracts: {
            registry: "0xb5f1772159bCe5f2137492bf6f68F83e4aA0B005",
            hook: "0x00427E39E353182d5595F8762Aa3559514615eCe",
        },
    },
    unichainSepolia: {
        id: 1301,
        name: "Unichain Sepolia",
        rpcUrl: "https://unichain-sepolia.g.alchemy.com/v2/BU56jBVBvxunrNMtZ1KIY",
        blockExplorer: "https://unichain-sepolia.blockscout.com",
        contracts: {
            registry: "0xb5f1772159bCe5f2137492bf6f68F83e4aA0B005",
            hook: "0x00427E39E353182d5595F8762Aa3559514615eCe",
        },
    },
} as const;

export const CONTRACTS = CHAINS.sepolia.contracts;
