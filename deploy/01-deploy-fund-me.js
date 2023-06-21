const { network } = require("hardhat");
const { networkConfig, devChains } = require("../helper-hardhat-config");

module.exports = async (hre) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	let ethUsdPriceFeedAddress;

	if (devChains.includes(network.name)) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		networkConfig[chainId]["ethUsdPriceFeedAddress"];
	}

	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress],
		log: true,
	});
	log("=============================================================");
};

module.exports.tags = ["all", "fundme"];
