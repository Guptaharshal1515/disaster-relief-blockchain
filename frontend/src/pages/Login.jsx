import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const Login = () => {
    const navigate = useNavigate();
    const { connectWallet, account } = useWallet();

    const [step, setStep] = useState(1); // 1: Aadhaar, 2: Wallet
    const [aadhaar, setAadhaar] = useState('');
    const [role, setRole] = useState('victim'); // 'victim' or 'admin'
    const [loading, setLoading] = useState(false);

    const handleAadhaarVerify = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate verification delay
        setTimeout(() => {
            setLoading(false);
            if (aadhaar.length >= 4) { // Mock validation
                setStep(2);
            } else {
                alert("Invalid Aadhaar ID (Mock: enter 4+ chars)");
            }
        }, 1000);
    };

    const handleEnterDashboard = () => {
        if (role === 'admin') {
            navigate('/admin');
        } else if (role === 'donor') {
            navigate('/donor');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <span className="text-neon">EIBS</span> Relief
                </h1>

                {step === 1 && (
                    <form onSubmit={role === 'victim' ? handleAadhaarVerify : (e) => { e.preventDefault(); setStep(2); }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0' }}>Select Role</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className={`btn ${role === 'victim' ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ flex: 1 }}
                                    onClick={() => setRole('victim')}
                                >
                                    Victim
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${role === 'donor' ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ flex: 1 }}
                                    onClick={() => setRole('donor')}
                                >
                                    Donor
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ flex: 1 }}
                                    onClick={() => setRole('admin')}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {role === 'victim' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0' }}>Aadhaar ID (Simulated)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter Aadhaar Number"
                                    value={aadhaar}
                                    onChange={(e) => setAadhaar(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Verifying...' : (role === 'victim' ? 'Verify Identity' : 'Continue')}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <p style={{ marginBottom: '2rem', color: '#a0a0a0' }}>
                            Identity Verified. Please connect your wallet to access the system.
                        </p>

                        {!account ? (
                            <button onClick={connectWallet} className="btn btn-primary" style={{ width: '100%' }}>
                                Connect MetaMask
                            </button>
                        ) : (
                            <div>
                                <div style={{ padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                                    <span className="text-neon">Connected:</span> {account.slice(0, 6)}...{account.slice(-4)}
                                </div>
                                <button onClick={handleEnterDashboard} className="btn btn-primary" style={{ width: '100%' }}>
                                    Enter Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
