import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import { HardhatUserConfig, task } from "hardhat/config";

import "./tasks";

import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PRIVATE_KEY!;
const bscScanApiKey = process.env.BSCSCAN_API_KEY!;

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);

    console.log(ethers.formatEther(balance), "ETH");
  });

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    avax_fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [privateKey],
    },
    bnb_testnet: {
      url: "https://data-seed-prebsc-1-s2.bnbchain.org:8545/",
      chainId: 97,
      accounts: [privateKey],
    },
  },
  etherscan: {
    apiKey: {
      avalanche: "snowtrace", // apiKey is not required, just set a placeholder
      avax_fuji: "snowtrace", // apiKey is not required, just set a placeholder
      bscTestnet: bscScanApiKey, // obtain one at https://bscscan.com/
      bsc: bscScanApiKey, // obtain one at https://bscscan.com/
    },
  },
};

export default config;
