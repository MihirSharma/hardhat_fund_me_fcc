const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", () => {
	let fundMe;
	let deployer;
	let mockV3Aggregator;
	const sendValue = ethers.utils.parseEther("1");
	beforeEach(async () => {
		deployer = (await getNamedAccounts()).deployer;
		// const accounts = await ethers.getSigners();
		// const accountZero = accounts[0];
		await deployments.fixture(["all"]);
		fundMe = await ethers.getContract("FundMe");
		mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
	});

	describe("Contructor", async () => {
		it("Sets the aggregator address correctly", async () => {
			const response = await fundMe.getPriceFeed();
			let errorSample = new Error("You need to spend more ETH!");
			assert.equal(response, mockV3Aggregator.address);
		});
	});
	describe("Fund", async () => {
		it("fails if you don't send enough ETH", async () => {
			let err = null;
			fundMe.fund().catch(async function (error) {
				err = error;
				assert.equal(err, "You need to spend more ETH!");
			});
		});
		it("updated the amount funded data structure", async () => {
			await fundMe.fund({ value: sendValue });
			const resp = await fundMe.getAddressToAmountFunded(deployer);
			assert.equal(resp.toString(), sendValue.toString());
		});
		it("Adds funder to array of funders", async () => {
			await fundMe.fund({ value: sendValue });
			const funder = await fundMe.s_funders(0);
			assert.equal(funder, deployer);
		});
	});
	describe("Withdraw", async () => {
		beforeEach(async () => {
			await fundMe.fund({ value: sendValue });
		});

		it("withdraw eth from a single funder", async () => {
			//Arrange
			const startingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const startingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);
			//Act
			const txResp = await fundMe.withdraw();
			const txReceipt = await txResp.wait();
			let { gasUsed, effectiveGasPrice } = txReceipt;
			let gasCost = gasUsed.mul(effectiveGasPrice);
			const endingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const endingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);
			//Assert
			assert.equal(endingFundMeBalance, 0);
			assert.equal(
				startingFundMeBalance.add(startingDeployerBalance).toString(),
				endingDeployerBalance.add(gasCost).toString()
			);
		});

		it("withdraw eth from multiple funders", async () => {
			//Arrange
			const accounts = await ethers.getSigners();
			for (let i = 1; i < 6; i++) {
				const account = accounts[i];
				const fundMeConnectedContract = await fundMe.connect(account);
				await fundMeConnectedContract.fund({ value: sendValue });
				const fundMeBalanceItr = await fundMe.provider.getBalance(
					fundMe.address
				);
			}
			const startingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const startingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);
			//Act
			const txResp = await fundMe.withdraw();
			const txReceipt = await txResp.wait();
			let { gasUsed, effectiveGasPrice } = txReceipt;
			let gasCost = gasUsed.mul(effectiveGasPrice);
			const endingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const endingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);
			//Assert
			assert.equal(endingFundMeBalance, 0), "FundMe balance should be 0";
			assert.equal(
				startingFundMeBalance.add(startingDeployerBalance).toString(),
				endingDeployerBalance.add(gasCost).toString(),
				"Deployer balance should be equal to starting balance + gas cost"
			);
			await fundMe.s_funders(0).catch((error) => {
				assert.equal(error.data, "0x", "funders array should be empty");
			});
			for (let i = 1; i < 6; i++) {
				const account = accounts[i];
				assert.equal(
					await fundMe.getAddressToAmountFunded(account.address),
					0,
					`funder balance should be 0 for account ${account.address}`
				);
			}
		});

		it("Only allows the owner to withdraw", async () => {
			const accounts = await ethers.getSigners();
			const attacker = accounts[1];
			const attackerConnectedContract = await fundMe.connect(attacker);
			await attackerConnectedContract.withdraw().catch((error) => {
				assert.equal(
					error.toString().includes(`FundMe__NotOwner()`),
					true,
					"Should throw error : FundMe__NotOwner()"
				);
			});
		});

		it("cheaper withdraw eth from multiple funders", async () => {
			//Arrange
			const accounts = await ethers.getSigners();
			for (let i = 1; i < accounts.length; i++) {
				const account = accounts[i];
				const fundMeConnectedContract = await fundMe.connect(account);
				await fundMeConnectedContract.fund({ value: sendValue });
				const fundMeBalanceItr = await fundMe.provider.getBalance(
					fundMe.address
				);
			}
			const startingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const startingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);
			//Act
			const txResp = await fundMe.cheaperWithdraw();
			const txReceipt = await txResp.wait();
			let { gasUsed, effectiveGasPrice } = txReceipt;
			let gasCost = gasUsed.mul(effectiveGasPrice);
			const endingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const endingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);
			//Assert
			assert.equal(endingFundMeBalance, 0), "FundMe balance should be 0";
			assert.equal(
				startingFundMeBalance.add(startingDeployerBalance).toString(),
				endingDeployerBalance.add(gasCost).toString(),
				"Deployer balance should be equal to starting balance + gas cost"
			);
			await fundMe.s_funders(0).catch((error) => {
				assert.equal(error.data, "0x", "funders array should be empty");
			});
			for (let i = 1; i < accounts.length; i++) {
				const account = accounts[i];
				assert.equal(
					await fundMe.getAddressToAmountFunded(account.address),
					0,
					`funder balance should be 0 for account ${account.address}`
				);
			}
		});
	});
});
