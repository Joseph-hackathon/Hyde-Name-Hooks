import { http, createConfig } from 'wagmi';
import { sepolia, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { CHAINS } from './contracts';

export const config = createConfig({
    chains: [
        sepolia,
        baseSepolia,
        {
            id: CHAINS.unichainSepolia.id,
            name: CHAINS.unichainSepolia.name,
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: {
                default: { http: [CHAINS.unichainSepolia.rpcUrl] },
                public: { http: [CHAINS.unichainSepolia.rpcUrl] },
            },
            blockExplorers: {
                default: {
                    name: 'Unichain Sepolia Explorer',
                    url: CHAINS.unichainSepolia.blockExplorer,
                },
            },
            testnet: true,
        },
    ],
    connectors: [injected()],
    transports: {
        [sepolia.id]: http(),
        [baseSepolia.id]: http(CHAINS.baseSepolia.rpcUrl),
        [CHAINS.unichainSepolia.id]: http(CHAINS.unichainSepolia.rpcUrl),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}
