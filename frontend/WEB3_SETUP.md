# Web3 Wallet Integration Setup

## MetaMask Configuration

This app uses **MetaMask only** for wallet connectivity.

## Testing on Sepolia Testnet

1. **Install MetaMask**
   - Download from [metamask.io](https://metamask.io/)
   - Install the browser extension

2. **Add Sepolia Network**
   - Open MetaMask
   - Click network dropdown → "Add Network"
   - Select "Sepolia" from the list or add manually:
     - Network Name: Sepolia
     - RPC URL: `https://rpc.sepolia.org`
     - Chain ID: `11155111`
     - Currency Symbol: `ETH`

3. **Get Test ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - Enter your wallet address
   - Receive free test ETH

4. **Connect to the App**
   - Click "Connect Wallet" button
   - Select MetaMask in the popup
   - Approve the connection

## Features Enabled

✅ MetaMask wallet connection  
✅ Sepolia testnet integration  
✅ Real-time balance fetching  
✅ ENS name resolution (from Mainnet)  
✅ Network detection  
✅ Disconnect functionality  

## Troubleshooting

**"MetaMask not detected"**
- Make sure MetaMask extension is installed
- Refresh the page
- Try disabling other wallet extensions

**Wrong Network**
- Switch to Sepolia in MetaMask
- The app will automatically detect the network change

**Connection rejected**
- Check if MetaMask is locked
- Try disconnecting and reconnecting

## Next Steps

- Deploy contracts to Sepolia
- Connect contract interactions
- Add transaction signing
