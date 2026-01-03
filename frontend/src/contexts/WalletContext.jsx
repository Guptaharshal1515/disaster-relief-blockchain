import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const SEPOLIA_CHAIN_ID = 11155111; // Sepolia chain ID in decimal

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask is not installed! Please install MetaMask extension.");
                return;
            }

            setIsConnecting(true);
            setError('');

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            // Create provider
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const network = await web3Provider.getNetwork();

            setAccount(accounts[0]);
            setProvider(web3Provider);
            setChainId(Number(network.chainId));

            console.log('Connected:', accounts[0]);
            console.log('Network:', network.chainId);

            // Check if on Sepolia
            if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
                alert(`Please switch to Sepolia Testnet in MetaMask!\nCurrent network: ${network.chainId}`);
            }

        } catch (err) {
            console.error('Connection error:', err);
            setError(err.message);
            alert(`Failed to connect: ${err.message}`);
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    setAccount(null);
                    setProvider(null);
                } else {
                    setAccount(accounts[0]);
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, []);

    return (
        <WalletContext.Provider value={{
            account,
            provider,
            chainId,
            connectWallet,
            isConnecting,
            error
        }}>
            {children}
        </WalletContext.Provider>
    );
};
