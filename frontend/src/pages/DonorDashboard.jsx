import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import DisasterReliefFund from '../contracts/DisasterReliefFund.json';

// UPDATE THIS AFTER DEPLOYING TO SEPOLIA
// Run: npx hardhat run scripts/deploy.js --network sepolia
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const DonorDashboard = () => {
    const { account, provider } = useWallet();
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState("0");
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState("");

    const fetchBalance = async () => {
        if (provider && account) {
            try {
                console.log('Fetching balance for account:', account);
                const bal = await provider.getBalance(account);
                console.log('Raw balance:', bal.toString());
                const formattedBalance = ethers.formatEther(bal);
                console.log('Formatted balance:', formattedBalance);
                setBalance(formattedBalance);
            } catch (error) {
                console.error('Error fetching balance:', error);
                alert('Failed to fetch balance. Please refresh the page.');
            }
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [provider, account]);

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!provider) return;

        // Check if user has enough balance (leave 0.02 for gas)
        const donationAmount = parseFloat(amount);
        const currentBalance = parseFloat(balance);

        if (donationAmount + 0.02 > currentBalance) {
            alert(`Insufficient balance!\n\nYou have: ${currentBalance.toFixed(4)} SepoliaETH\nTrying to donate: ${donationAmount} SepoliaETH\nGas needed: ~0.02 SepoliaETH\n\nMax you can donate: ${Math.max(0, currentBalance - 0.02).toFixed(4)} SepoliaETH`);
            return;
        }

        setLoading(true);
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, DisasterReliefFund.abi, signer);

            const tx = await contract.donate({ value: ethers.parseEther(amount) });
            await tx.wait();

            setTxHash(tx.hash);
            alert("Thank you for your donation!");
            setAmount("");

            // Refresh balance
            const newBal = await provider.getBalance(account);
            setBalance(ethers.formatEther(newBal));
        } catch (err) {
            console.error(err);
            alert("Donation Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="text-neon" style={{ textAlign: 'center', marginBottom: '2rem' }}>Donor Dashboard</h1>

            {!account && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⚠️ Wallet Not Connected</p>
                    <p style={{ color: '#a0a0a0' }}>Please connect your MetaMask wallet to view your balance and make donations.</p>
                </div>
            )}

            {account && (

                <div className="card">
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>Your Balance</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff41' }}>
                                    {parseFloat(balance).toFixed(4)} SepoliaETH
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                    Network: Sepolia Testnet
                                </div>
                            </div>
                            <button
                                onClick={fetchBalance}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#00ff41',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '1rem' }}>Make a Donation</h3>
                    <p style={{ marginBottom: '1.5rem', color: '#a0a0a0' }}>
                        Your contribution directly helps victims. All transactions are on-chain.
                    </p>

                    <form onSubmit={handleDonate}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount (SepoliaETH)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 0.1"
                                max={Math.max(0, parseFloat(balance) - 0.02)}
                                required
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                Min: 0.01 SepoliaETH | Max: {Math.max(0, parseFloat(balance) - 0.02).toFixed(4)} SepoliaETH
                            </p>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Donate via Crypto'}
                        </button>
                    </form>

                    {txHash && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: '#00ff41' }}>✓ Success! TX: {txHash.slice(0, 10)}...</p>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>
                            Prefer UPI? <span style={{ color: '#00ff41' }}>relief@upi</span> (Demo)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorDashboard;
