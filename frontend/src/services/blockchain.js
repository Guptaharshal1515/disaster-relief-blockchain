import { ethers } from 'ethers';
import DisasterReliefFundArtifact from '../../artifacts/contracts/DisasterReliefFund.sol/DisasterReliefFund.json';

// Configuration - Replace with your deployed address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default

const getProvider = () => {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
};

const getSigner = async (provider) => {
    return await provider.getSigner();
};

const getContract = async (signerOrProvider) => {
    return new ethers.Contract(CONTRACT_ADDRESS, DisasterReliefFundArtifact.abi, signerOrProvider);
};

export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = getProvider();
    const signer = await getSigner(provider);
    const address = await signer.getAddress();
    return { provider, signer, address };
};

export const donate = async (signer, amountETH) => {
    const contract = await getContract(signer);
    const tx = await contract.donate({ value: ethers.parseEther(amountETH) });
    await tx.wait();
    return tx.hash;
};

export const getDonations = async (provider, address) => {
    const contract = await getContract(provider);
    const balance = await contract.getDonation(address);
    return ethers.formatEther(balance);
};

export const getTotalRaised = async (provider) => {
    const contract = await getContract(provider);
    const total = await contract.totalDonations();
    return ethers.formatEther(total);
};

export const withdraw = async (signer, amountETH) => {
    const contract = await getContract(signer);
    const tx = await contract.withdraw(ethers.parseEther(amountETH));
    await tx.wait();
    return tx.hash;
};
