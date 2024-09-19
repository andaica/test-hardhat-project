import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import { HardhatUserConfig, task } from "hardhat/config";

import "./tasks";

import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PRIVATE_KEY!;
const bscScanApiKey = process.env.BSCSCAN_API_KEY!;
const polygonScanApiKey = process.env.POLYGONSCAN_API_KEY!;

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
    polygon_amoy: {
      url: "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: [privateKey],
    },
    derachain: {
      chainId: 20240801,
      url: "https://rpc-testnet.derachain.com/ext/bc/2LZp9ypK4SWm3a8MBYZbxTZgKbvB4aemUf83cBp1hSnvP7SFiw/rpc",
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      avalanche: "snowtrace", // apiKey is not required, just set a placeholder
      avax_fuji: "snowtrace", // apiKey is not required, just set a placeholder
      bscTestnet: bscScanApiKey, // obtain one at https://bscscan.com/
      bsc: bscScanApiKey, // obtain one at https://bscscan.com/
      polygonAmoy: polygonScanApiKey, // obtain one at https://polygonscan.com/
      derachain: "empty",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "derachain",
        chainId: 20240801,
        urls: {
          apiURL: "https://trace.derachain.com/api",
          browserURL: "https://trace.derachain.com",
        },
      },
    ],
  },
};

export default config;
