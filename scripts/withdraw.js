const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
	const { deployer } = await getNamedAccounts();
	const fundMe = await ethers.getContract("FundMe", deployer);
	console.log("Withdrawing ...");
	const txResp = await fundMe.withdraw();
	await txResp.wait(1);
	console.log("Funds Withdrawn");
};

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
