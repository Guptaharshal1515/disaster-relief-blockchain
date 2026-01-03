# Disaster Relief System Setup

## Prerequisites
- Node.js & npm
- MetaMask Wallet

## Smart Contracts
1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Run tests: `npx hardhat test`
4. Deploy to Sepolia: `npx hardhat run scripts/deploy.js --network sepolia`

## Frontend
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## Configuration
- Update `hardhat.config.js` with your Infura/Alchemy URL and Private Key for deployment.
- Ensure MetaMask is connected to the correct network.
