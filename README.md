#  Emergency & Disaster Relief Stablecoin System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.28.2-yellow)](https://hardhat.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)](https://vitejs.dev/)

> **A blockchain-based disaster relief platform ensuring transparent, instant, and fair distribution of funds to disaster victims.**

Built for **E-Summit'26** - Leveraging blockchain technology to revolutionize humanitarian aid distribution.

---

##  Table of Contents
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [User Flows](#-user-flows)
- [Smart Contract Details](#-smart-contract-details)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

##  Problem Statement

In the aftermath of disasters, traditional financial aid systems face critical challenges:
- ⏱️ **Delayed Funds**: Victims wait days or weeks for relief
- 🔒 **Lack of Transparency**: Donors can't track where their money goes
- 💸 **Fund Leakage**: Intermediaries and corruption reduce actual aid received
- 📊 **Poor Accountability**: No verifiable proof of fund distribution

---

##  Solution

A **Blockchain-based Disaster Relief System** that ensures:

✅ **Instant Transfers** - Direct crypto payments to victims  
✅ **Complete Transparency** - Every transaction recorded on-chain  
✅ **Fair Distribution** - Automated limits and cooldown periods  
✅ **Reduced Corruption** - Smart contract-enforced rules  
✅ **Donor Confidence** - Real-time tracking of contributions  

---

##  Key Features

### For Victims 
- **Auto-Withdrawal**: Instant access to ₹8000 (~0.029 ETH) without approval
- **Additional Requests**: Request higher amounts with admin verification
- **24-Hour Cooldown**: Fair distribution with enforced waiting periods
- **Withdrawal History**: Track all past transactions

### For Donors 
- **Crypto Donations**: Contribute ETH directly to the relief fund
- **Transaction Transparency**: View all donations on-chain
- **Instant Impact**: Funds immediately available for distribution

### For Admins 
- **Request Management**: Review and approve victim requests
- **Fund Allocation**: Authorize additional relief amounts
- **Dashboard Analytics**: Monitor fund flow and distributions

---

##  Tech Stack

### Blockchain
- **Solidity** `^0.8.28` - Smart contract development
- **Hardhat** `^2.28.2` - Development environment
- **Ethers.js** `^6.16.0` - Blockchain interaction
- **Ethereum Sepolia** - Testnet deployment

### Frontend
- **React** `^19.2.0` - UI framework
- **Vite** `^7.2.4` - Build tool
- **React Router** `^7.11.0` - Navigation
- **Lucide React** - Icon library

### Tools & Services
- **MetaMask** - Wallet integration
- **Infura/Alchemy** - RPC provider
- **Git** - Version control

---

##  Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Victim  │  │  Donor   │  │  Admin   │              │
│  │Dashboard │  │Dashboard │  │Dashboard │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────┬────────────────────────────────────┘
                     │ Ethers.js
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Ethereum Blockchain (Sepolia)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │      DisasterReliefFund.sol (Smart Contract)     │  │
│  │  • Donations        • Auto-Withdraw              │  │
│  │  • Requests         • Admin Approval             │  │
│  │  • Allocations      • Cooldown Logic             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

##  Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/disaster-relief-blockchain.git
   cd disaster-relief-blockchain
   ```

2. **Install smart contract dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=your_wallet_private_key_here
   ```
   
   > ⚠️ **NEVER commit your `.env` file to version control!**

4. **Compile smart contracts**
   ```bash
   npx hardhat compile
   ```

5. **Run tests**
   ```bash
   npx hardhat test
   ```

6. **Deploy to Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   
    **Copy the deployed contract address!**

7. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

8. **Update contract address**
   
   Replace `CONTRACT_ADDRESS` in:
   - `frontend/src/pages/VictimDashboard.jsx`
   - `frontend/src/pages/DonorDashboard.jsx`
   - `frontend/src/pages/AdminDashboard.jsx`

9. **Start the development server**
   ```bash
   npm run dev
   ```

10. **Open your browser**
    
    Navigate to `http://localhost:5173`

---


##  User Flows

###  Victim Flow
1. Select "Victim" role
2. Enter Aadhaar number (simulated)
3. Connect MetaMask wallet
4. **Quick Withdraw**: Get 0.029 ETH instantly (if eligible)
5. **Request More**: Submit request for additional funds
6. Wait for admin approval (if requesting more)
7. Withdraw approved funds

###  Donor Flow
1. Select "Donor" role
2. Connect MetaMask wallet
3. Enter donation amount (min 0.01 ETH)
4. Click "Donate via Crypto"
5. Approve transaction in MetaMask
6. Receive transaction confirmation

###  Admin Flow
1. Select "Admin" role
2. Connect MetaMask wallet (must be contract deployer)
3. View pending victim requests
4. Review request details
5. Approve or reject requests
6. Sign transaction to allocate funds

---

##  Smart Contract Details

### DisasterReliefFund.sol

**Key Parameters:**
- `AUTO_WITHDRAW_LIMIT`: 0.029 ETH (~₹8000 INR)
- `COOLDOWN_PERIOD`: 24 hours (86400 seconds)

**Main Functions:**
- `donate()` - Accept ETH donations
- `requestFunds(uint256 amount)` - Victim requests relief
- `autoWithdraw()` - Instant withdrawal up to limit
- `approveRequest(address victim, uint256 amount)` - Admin approval
- `withdraw()` - Victim withdraws approved funds

**Events:**
- `DonationReceived(address donor, uint256 amount)`
- `FundsRequested(address victim, uint256 amount)`
- `RequestApproved(address victim, uint256 amount)`
- `FundsWithdrawn(address victim, uint256 amount)`


---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- Built for **E-Summit'26** Blockchain Challenge
- Inspired by the need for transparent disaster relief
- Powered by Ethereum and the Web3 community

---

**Project Link**: [https://github.com/Guptaharshal1515/disaster-relief-blockchain](https://github.com/Guptaharshal1515/disaster-relief-blockchain)

---

## ⚠️ Disclaimer

This is a **demonstration project** for educational purposes. The Aadhaar verification is simulated. For production use:
- Implement real identity verification
- Use actual stablecoins (USDC, DAI)
- Add comprehensive security audits
- Implement proper access controls
- Add legal compliance measures
