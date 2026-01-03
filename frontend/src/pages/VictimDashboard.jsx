import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import DisasterReliefFund from '../contracts/DisasterReliefFund.json';

// UPDATE THIS AFTER DEPLOYING TO SEPOLIA
// Run: npx hardhat run scripts/deploy.js --network sepolia
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const VictimDashboard = () => {
    const { account, provider } = useWallet();
    const [contract, setContract] = useState(null);
    const [data, setData] = useState({
        allocation: "0",
        withdrawn: "0",
        available: "0"
    });
    const [amount, setAmount] = useState("");
    const [requests, setRequests] = useState([]);
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (provider && account) {
            provider.getSigner().then(signer => {
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, DisasterReliefFund.abi, signer);
                setContract(contractInstance);
                fetchData(contractInstance, account);
            });

            const allRequests = JSON.parse(localStorage.getItem('reliefRequests') || '[]');
            setRequests(allRequests.filter(r => r.address === account));

            // Load withdrawal history
            const history = JSON.parse(localStorage.getItem('withdrawalHistory') || '[]');
            setWithdrawalHistory(history.filter(h => h.address === account));
        }
    }, [provider, account]);

    const fetchData = async (contractInstance, userAddress) => {
        try {
            const alloc = await contractInstance.getRecipientAllocation(userAddress);
            const withdrawn = await contractInstance.getWithdrawnAmount(userAddress);

            // Calculate available (Simple Subtraction)
            const allocBn = BigInt(alloc);
            const withdrawnBn = BigInt(withdrawn);
            const availableBn = allocBn - withdrawnBn;

            setData({
                allocation: ethers.formatEther(alloc),
                withdrawn: ethers.formatEther(withdrawn),
                available: ethers.formatEther(availableBn)
            });
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    const handleRequest = (e) => {
        e.preventDefault();
        // Cooldown check
        const lastRequest = requests[requests.length - 1];
        if (lastRequest && (Date.now() - lastRequest.timestamp < 24 * 60 * 60 * 1000)) {
            // Optional: Alert user. For now, we allow submitting as Pending.
        }

        const newRequest = {
            id: Date.now(),
            address: account,
            amount: amount,
            status: 'Pending',
            timestamp: Date.now()
        };

        const existing = JSON.parse(localStorage.getItem('reliefRequests') || '[]');
        localStorage.setItem('reliefRequests', JSON.stringify([...existing, newRequest]));
        setRequests([...requests, newRequest]);
        setAmount("");
        alert("Request Submitted! Waiting for Admin Approval.");
    };

    const handleWithdraw = async (withdrawAmount) => {
        if (!contract) return;
        setLoading(true);
        try {
            const amountWei = ethers.parseEther(withdrawAmount);

            if (amountWei <= 0) {
                alert("Invalid amount.");
                setLoading(false);
                return;
            }

            const tx = await contract.withdraw(amountWei);
            await tx.wait();

            // Save to withdrawal history
            const newWithdrawal = {
                id: Date.now(),
                address: account,
                amount: withdrawAmount,
                txHash: tx.hash,
                timestamp: Date.now(),
                type: parseFloat(withdrawAmount) <= 0.029 ? 'Auto' : 'Approved'
            };

            const existingHistory = JSON.parse(localStorage.getItem('withdrawalHistory') || '[]');
            localStorage.setItem('withdrawalHistory', JSON.stringify([...existingHistory, newWithdrawal]));
            setWithdrawalHistory([...withdrawalHistory, newWithdrawal]);

            alert("Withdrawal Successful!");
            fetchData(contract, account);
        } catch (err) {
            console.error(err);
            alert("Withdrawal Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Victim <span className="text-neon">Dashboard</span></h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Total Allocated</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.allocation} ETH</div>
                    </div>
                    <div>
                        <div style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Available to Withdraw</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff41' }}>{data.available} ETH</div>
                    </div>
                </div>

                <div style={{ padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#00ff41', marginBottom: '0.5rem' }}>✓ Auto-Withdraw Enabled</p>
                    <p style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
                        You can withdraw up to 0.029 ETH (~₹8000) every 24 hours without admin approval.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <button
                        onClick={() => handleWithdraw("0.029")}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Quick Withdraw (0.029 ETH)'}
                    </button>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Request Additional Funds</h3>
                <form onSubmit={handleRequest} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="number"
                        step="0.01"
                        className="input"
                        placeholder="Amount (ETH)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                        Submit Request
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: '#a0a0a0', marginBottom: '0.5rem' }}>Request History</h4>
                    {requests.length === 0 && <p style={{ fontSize: '0.9rem', color: '#666' }}>No requests yet.</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {requests.slice().reverse().map(req => (
                            <li key={req.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Requested {req.amount} ETH</span>
                                <span style={{
                                    color: req.status === 'Approved' ? '#00ff41' : (req.status === 'Rejected' ? '#ff4d4d' : '#ffa500')
                                }}>
                                    {req.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
                    <h4 style={{ color: '#a0a0a0', marginBottom: '1rem' }}>Withdrawal History</h4>
                    {withdrawalHistory.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>No withdrawals yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {withdrawalHistory.slice().reverse().map(w => (
                                <div key={w.id} style={{
                                    padding: '1rem',
                                    background: '#1a1a1a',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid #00ff41'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', color: '#00ff41' }}>{w.amount} ETH</span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            padding: '0.25rem 0.5rem',
                                            background: w.type === 'Auto' ? '#00ff4120' : '#ffa50020',
                                            color: w.type === 'Auto' ? '#00ff41' : '#ffa500',
                                            borderRadius: '0.25rem'
                                        }}>
                                            {w.type}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
                                        {new Date(w.timestamp).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                                        TX: {w.txHash.slice(0, 10)}...{w.txHash.slice(-8)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VictimDashboard;
