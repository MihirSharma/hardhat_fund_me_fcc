const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
	const { deployer } = await getNamedAccounts();
	const fundMe = await ethers.getContract("FundMe", deployer);
	console.log("Funding Contract");
	const txResp = await fundMe.fund({ value: ethers.utils.parseEther("0.1") });
	await txResp.wait(1);
	console.log("Funded Contract");
};

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
