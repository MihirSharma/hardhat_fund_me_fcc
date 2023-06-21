const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();
require("./tasks/accounts");
require("./tasks/block-number");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		ganache: {
			url: process.env.GANACHE_RPC_URL,
			accounts: [process.env.GANACHE_ACCOUNT_PRIVATE_KEY],
			chainId: 1337,
		},
		localhost: {
			url: "http://127.0.0.1:8545",
			// accounts: [process.env.GANACHE_ACCOUNT_PRIVATE_KEY],
			chainId: 31337,
		},
	},
	gasReporter: {
		enabled: true,
		outputFile: "gas-report.txt",
		currency: "USD",
		noColors: true,
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
			31337: 0,
		},
	},
	solidity: {
		compilers: [{ version: "0.6.6" }, { version: "0.8.18" }],
	},
};
