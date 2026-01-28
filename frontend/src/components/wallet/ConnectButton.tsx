import { useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { useConnect, useAccount } from 'wagmi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';

export default function ConnectButton() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useWallet();
    const { connectors, connect, isPending, error } = useConnect();
    const [showModal, setShowModal] = useState(false);

    const handleConnect = () => {
        const connector = connectors[0]; // Injected connector (MetaMask)
        if (connector) {
            connect({ connector }, {
                onSuccess: () => {
                    setShowModal(false);
                },
                onError: (err) => {
                    console.error('Connection error:', err);
                }
            });
        }
    };

    // Check if MetaMask is installed
    const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum;

    if (isConnected && address) {
        return (
            <Button
                variant="secondary"
                size="sm"
                onClick={disconnect}
            >
                {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="primary"
                size="sm"
                onClick={() => setShowModal(true)}
                loading={isPending}
            >
                <Wallet className="w-4 h-4" />
                Connect Wallet
            </Button>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Connect Wallet"
                size="sm"
            >
                <div className="space-y-4">
                    {!isMetaMaskInstalled ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-900 mb-1">MetaMask Not Detected</h4>
                                    <p className="text-sm text-red-700 mb-3">
                                        Please install MetaMask browser extension to continue.
                                    </p>
                                    <a
                                        href="https://metamask.io/download/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                                    >
                                        Install MetaMask
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-600 mb-6">
                                Connect your MetaMask wallet to access Hyde Name Hooks and start trading with MEV protection on Sepolia testnet.
                            </p>

                            <button
                                onClick={handleConnect}
                                disabled={isPending}
                                className="w-full p-6 rounded-2xl border-2 border-slate-100 hover:border-brand-blue transition-all hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Wallet className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-xl text-brand-dark group-hover:text-brand-blue transition-colors mb-1">
                                            MetaMask
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {isPending ? 'Connecting...' : 'Connect with MetaMask browser extension'}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <p className="text-sm text-red-700">
                                        <strong>Error:</strong> {error.message}
                                    </p>
                                </div>
                            )}

                            <div className="bg-pastel-blue p-4 rounded-xl">
                                <p className="text-sm text-slate-700">
                                    <strong>Note:</strong> Make sure you're connected to <strong>Sepolia Testnet</strong> in MetaMask.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
}
