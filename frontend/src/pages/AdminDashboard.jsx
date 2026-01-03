import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import DisasterReliefFund from '../contracts/DisasterReliefFund.json';

// UPDATE THIS AFTER DEPLOYING TO SEPOLIA
// Run: npx hardhat run scripts/deploy.js --network sepolia
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const AdminDashboard = () => {
    const { account, provider } = useWallet();
    const [contract, setContract] = useState(null);
    const [requests, setRequests] = useState([]);
    const [balance, setBalance] = useState("0");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (provider) {
            provider.getSigner().then(signer => {
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, DisasterReliefFund.abi, signer);
                setContract(contractInstance);
                provider.getBalance(CONTRACT_ADDRESS).then(bal => {
                    setBalance(ethers.formatEther(bal));
                });
            });
        }

        const storedRequests = JSON.parse(localStorage.getItem('reliefRequests') || '[]');
        setRequests(storedRequests.filter(r => r.status === 'Pending'));
    }, [provider]);

    const handleApprove = async (req) => {
        if (!contract) return;
        setLoading(true);
        try {
            const amountWei = ethers.parseEther(req.amount);

            // addRecipient now adds to existing allocation (contract updated)
            const tx = await contract.addRecipient(req.address, amountWei);
            await tx.wait();

            const allRequests = JSON.parse(localStorage.getItem('reliefRequests') || '[]');
            const updatedRequests = allRequests.map(r =>
                r.id === req.id ? { ...r, status: 'Approved', txHash: tx.hash } : r
            );
            localStorage.setItem('reliefRequests', JSON.stringify(updatedRequests));
            setRequests(updatedRequests.filter(r => r.status === 'Pending'));

            alert("Request Approved & On-Chain Transaction Confirmed!");
        } catch (err) {
            console.error(err);
            alert("Transaction Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = (id) => {
        const allRequests = JSON.parse(localStorage.getItem('reliefRequests') || '[]');
        const updatedRequests = allRequests.map(r =>
            r.id === id ? { ...r, status: 'Rejected' } : r
        );
        localStorage.setItem('reliefRequests', JSON.stringify(updatedRequests));
        setRequests(updatedRequests.filter(r => r.status === 'Pending'));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1>Admin <span className="text-neon">Dashboard</span></h1>
                <div className="card">
                    <span style={{ color: '#a0a0a0' }}>Contract Balance:</span>
                    <strong className="text-neon" style={{ marginLeft: '0.5rem', fontSize: '1.2rem' }}>{balance} ETH</strong>
                </div>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Fund Requests (Pending)</h2>
                {requests.length === 0 ? (
                    <p style={{ color: '#a0a0a0', textAlign: 'center' }}>No pending requests.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {requests.map(req => (
                            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Address: <span style={{ fontFamily: 'monospace', color: '#a0a0a0' }}>{req.address}</span></div>
                                    <div style={{ color: '#00ff41' }}>Requested: {req.amount} ETH</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(req.timestamp).toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleApprove(req)}
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        className="btn btn-outline"
                                        disabled={loading}
                                        style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
