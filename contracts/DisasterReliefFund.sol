// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Utility.sol";

/**
 * @title DisasterReliefFund
 * @dev Manages donations, recipient allocations, and withdrawals for disaster relief.
 * Includes governance controls and emergency mechanisms.
 */
contract DisasterReliefFund {
    using Utility for uint256;
    using Utility for address;

    // --- State Variables ---

    address public admin;
    bool public paused;
    uint256 public minDonation;
    uint256 public withdrawalLimit;
    
    // Total funds collected
    uint256 public totalDonations;

    // Donor mapping: address => total amount donated
    mapping(address => uint256) private _donations;

    // Recipient mapping: address => total allocation authorized
    mapping(address => uint256) private _allocations;

    // Recipient withdrawal tracking: address => amount withdrawn
    mapping(address => uint256) private _withdrawn;
    
    // Cooldown tracking: address => timestamp of last withdrawal
    mapping(address => uint256) private _lastWithdrawalTime;

    // Verified victims who can auto-withdraw daily limits
    mapping(address => bool) public verifiedVictims;
    
    // Auto-withdraw limit (~8000 INR equivalent in ETH)
    uint256 public constant AUTO_WITHDRAW_LIMIT = 0.029 ether;
    uint256 public constant COOLDOWN_PERIOD = 24 hours;

    // --- Events ---

    event DonationReceived(address indexed donor, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event RecipientAdded(address indexed recipient, uint256 allocation);
    event VictimVerified(address indexed victim);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event ParameterUpdated(string parameter, uint256 newValue);
    event Paused(address account);
    event Unpaused(address account);

    // --- Modifiers ---

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr.isValidPrincipal(), "Invalid address");
        _;
    }

    // --- Constructor ---

    constructor(uint256 _minDonation, uint256 _withdrawalLimit) {
        require(_minDonation > 0, "Min donation must be > 0");
        admin = msg.sender;
        minDonation = _minDonation;
        withdrawalLimit = _withdrawalLimit;
        paused = false;
    }

    // --- Donation Logic ---

    function donate() external payable whenNotPaused {
        require(msg.value >= minDonation, "Donation below minimum amount");

        _donations[msg.sender] = _donations[msg.sender].safeAdd(msg.value);
        totalDonations = totalDonations.safeAdd(msg.value);

        emit DonationReceived(msg.sender, msg.value);
    }

    function getDonation(address user) external view returns (uint256) {
        return _donations[user];
    }

    // --- Recipient Management (Admin Only) ---

    function verifyVictim(address victim) external onlyAdmin validAddress(victim) {
        verifiedVictims[victim] = true;
        emit VictimVerified(victim);
    }

    function addRecipient(address recipient, uint256 allocation) external onlyAdmin validAddress(recipient) {
        require(allocation > 0, "Allocation must be > 0");
        _allocations[recipient] = _allocations[recipient].safeAdd(allocation);
        emit RecipientAdded(recipient, allocation);
    }

    function getRecipientAllocation(address recipient) external view returns (uint256) {
        return _allocations[recipient];
    }

    function getWithdrawnAmount(address recipient) external view returns (uint256) {
        return _withdrawn[recipient];
    }

    // --- Withdrawal Logic ---

    function withdraw(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(amount <= withdrawalLimit, "Exceeds absolute max withdrawal limit");
        
        // Cooldown check (Applies to ALL withdrawals)
        require(block.timestamp >= _lastWithdrawalTime[msg.sender].safeAdd(COOLDOWN_PERIOD), "Withdrawal cooldown active (24h)");
        require(address(this).balance >= amount, "Insufficient contract balance");

        bool isAutoWithdraw = (amount <= AUTO_WITHDRAW_LIMIT && verifiedVictims[msg.sender]);
        
        if (!isAutoWithdraw) {
            // If not auto-eligible (too high amount or not verified), check allocation
            uint256 allocation = _allocations[msg.sender];
            require(allocation > 0, "No allocation. Please request admin approval.");
            
            uint256 alreadyWithdrawn = _withdrawn[msg.sender];
            uint256 remaining = allocation.safeSubtract(alreadyWithdrawn);
            require(amount <= remaining, "Insufficient allocated funds. Request approval.");
            
            // Track allocation usage
            _withdrawn[msg.sender] = alreadyWithdrawn.safeAdd(amount);
        }
        
        // Update cooldown tracking
        _lastWithdrawalTime[msg.sender] = block.timestamp;

        // Interaction
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    // --- Governance & Admin Controls ---

    function setAdmin(address newAdmin) external onlyAdmin validAddress(newAdmin) {
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    function setMinDonation(uint256 amount) external onlyAdmin {
        minDonation = amount;
        emit ParameterUpdated("MinDonation", amount);
    }

    function setWithdrawalLimit(uint256 amount) external onlyAdmin {
        withdrawalLimit = amount;
        emit ParameterUpdated("WithdrawalLimit", amount);
    }

    function pause() external onlyAdmin {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function emergencyWithdraw() external onlyAdmin {
        require(paused, "Must be paused for emergency withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(admin).call{value: balance}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(admin, balance);
    }
}
