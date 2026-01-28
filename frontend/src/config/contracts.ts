export const CONTRACTS = {
    registry: "0x00427E39E353182d5595F8762Aa3559514615eCe",
    hook: "0x12a20919684Fe8C1625CCC816bD0e6801C49d371",
    chainId: 11155111, // Sepolia
} as const;

export const NETWORK = {
    id: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/",
    blockExplorer: "https://sepolia.etherscan.io",
} as const;
