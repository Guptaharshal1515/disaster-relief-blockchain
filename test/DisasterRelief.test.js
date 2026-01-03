const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DisasterReliefFund", function () {
    let DisasterReliefFund;
    let fund;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const Utility = await ethers.getContractFactory("Utility");
        const utility = await Utility.deploy();

        DisasterReliefFund = await ethers.getContractFactory("DisasterReliefFund", {
            libraries: {
                Utility: utility.target,
            },
        });

        // Min donation 0.01 ETH, Max Withdrawal 1 ETH
        fund = await DisasterReliefFund.deploy(ethers.parseEther("0.01"), ethers.parseEther("1"));
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await fund.admin()).to.equal(owner.address);
        });

        it("Should set the initial parameters", async function () {
            expect(await fund.minDonation()).to.equal(ethers.parseEther("0.01"));
            expect(await fund.withdrawalLimit()).to.equal(ethers.parseEther("1"));
        });
    });

    describe("Donations", function () {
        it("Should accept valid donations", async function () {
            await fund.connect(addr1).donate({ value: ethers.parseEther("0.1") });
            expect(await fund.getDonation(addr1.address)).to.equal(ethers.parseEther("0.1"));
            expect(await fund.totalDonations()).to.equal(ethers.parseEther("0.1"));
        });

        it("Should reject donations below minimum", async function () {
            await expect(
                fund.connect(addr1).donate({ value: ethers.parseEther("0.001") })
            ).to.be.revertedWith("Donation below minimum amount");
        });
    });

    describe("Recipient Management", function () {
        it("Should allow admin to add recipients", async function () {
            await fund.addRecipient(addr1.address, ethers.parseEther("0.5"));
            expect(await fund.getRecipientAllocation(addr1.address)).to.equal(ethers.parseEther("0.5"));
        });

        it("Should not allow non-admin to add recipients", async function () {
            await expect(
                fund.connect(addr1).addRecipient(addr2.address, ethers.parseEther("0.5"))
            ).to.be.revertedWith("Caller is not the admin");
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            // Seed contract
            await fund.donate({ value: ethers.parseEther("10") });
            // Add beneficiary
            await fund.addRecipient(addr1.address, ethers.parseEther("2"));
        });

        it("Should allow valid withdrawals", async function () {
            const initialBalance = await ethers.provider.getBalance(addr1.address);

            const tx = await fund.connect(addr1).withdraw(ethers.parseEther("0.5"));
            await tx.wait(); // wait for mining to get gas costs if we wanted to be precise, but we just check success

            expect(await fund.getWithdrawnAmount(addr1.address)).to.equal(ethers.parseEther("0.5"));
        });

        it("Should revert if withdrawal exceeds allocation", async function () {
            await expect(
                fund.connect(addr1).withdraw(ethers.parseEther("3"))
            ).to.be.revertedWith("Insufficient remaining allocation");
        });

        it("Should revert if withdrawal exceeds single limit", async function () {
            // Limit is 1 ETH
            await expect(
                fund.connect(addr1).withdraw(ethers.parseEther("1.1"))
            ).to.be.revertedWith("Exceeds single withdrawal limit");
        });
    });
});
