# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

Example deploy:

```shell
KIND=erc1155 NAME="My 1155 Collection" SYMBOL=my15 npx hardhat run ./scripts/deploy-contract.ts --network bnb_testnet
```

Example verify contract:

```shell
npx hardhat verify <contract address> "My 1155 Collection" my15 --network bnb_testnet
```