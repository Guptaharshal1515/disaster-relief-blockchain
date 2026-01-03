const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Sepolia...");

  // 1. Deploy Utility Library
  const Utility = await hre.ethers.getContractFactory("Utility");
  const utility = await Utility.deploy();
  await utility.waitForDeployment();
  const utilityAddress = await utility.getAddress();
  console.log(`Utility library deployed to: ${utilityAddress}`);

  // 2. Deploy DisasterReliefFund linked with Utility
  const DisasterReliefFund = await hre.ethers.getContractFactory("DisasterReliefFund", {
    libraries: {
      Utility: utilityAddress,
    },
  });

  // Parameters: minDonation (0.01 ETH), withdrawalLimit (1 ETH)
  const minDonation = hre.ethers.parseEther("0.01");
  const withdrawalLimit = hre.ethers.parseEther("1.0");

  const fund = await DisasterReliefFund.deploy(minDonation, withdrawalLimit);
  await fund.waitForDeployment();
  const fundAddress = await fund.getAddress();

  console.log(`\n✅ DisasterReliefFund deployed to: ${fundAddress}`);
  console.log(`- Min Donation: 0.01 ETH`);
  console.log(`- Withdrawal Limit: 1.0 ETH`);
  console.log(`- Auto-Withdraw Limit: 0.029 ETH (~₹8000)`);
  console.log(`\n📋 UPDATE CONTRACT_ADDRESS in frontend files to: ${fundAddress}`);
  console.log(`   - frontend/src/pages/AdminDashboard.jsx (line 8)`);
  console.log(`   - frontend/src/pages/VictimDashboard.jsx (line 8)`);
  console.log(`   - frontend/src/pages/DonorDashboard.jsx (line 7)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
