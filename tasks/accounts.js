const { task } = require("hardhat/config");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners();

	for (const account of accounts) {
		const contractBalance = await hre.ethers.provider.getBalance(
			account.address
		);
		console.log(account.address + " :  " + contractBalance.toString());
	}
});

module.exports = {};
