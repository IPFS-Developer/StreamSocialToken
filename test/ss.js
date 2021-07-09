const { web3tx, toWad, wad4human } = require("@decentral.ee/web3-helpers");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const MainMintingContract = artifacts.require("MainMintingContract");
const SocialStreamableNFT = artifacts.require("SocialStreamableNFT");
const traveler = require("ganache-time-traveler");
const TEST_TRAVEL_TIME = 3600 * 20; // 10 hours

contract("MainMintingContract", async (accounts) => {
	const errorHandler = (err) => {
		if (err) throw err;
	};

	const names = ["Admin", "Alice", "Bob", "Carol", "Dan", "Emma", "Frank"];
	accounts = accounts.slice(0, names.length);

	let sf;
	let dai;
	let daix;
	let app;
	let _mainMint;
	let _nftContract;
	const u = {}; // object with all users
	const aliases = {};

	// before(async function () {
	// 	//process.env.RESET_SUPERFLUID_FRAMEWORK = 1;
	// 	await deployFramework(errorHandler, {
	// 		web3,
	// 		from: accounts[0],
	// 	});
	// });

	beforeEach(async function () {
		sf = new SuperfluidSDK.Framework({
			web3,
			version: "test",
			tokens: ["fDAI"],
		});
		await sf.initialize();
		daix = sf.tokens.fDAIx;
		// console.log("Address");
		// console.log(sf.host.address);
		// console.log("TokenFactory");
		// let st = await sf.host.getSuperTokenFactory();
		_mainMint = await MainMintingContract.deployed();
		_nftContract = await SocialStreamableNFT.deployed();
		// _mainMint = await MainMintingContract.new(
		// 	sf.host.address,
		// 	sf.agreements.cfa.address,
		// 	st
		// );
	});

	async function checkOwner() {
		const owner = await _nftContract.ownerOf("0");
		console.log("Contract Owner: ", aliases[owner], " = ", owner);
		return owner.toString();
	}

	async function transferNFT(to) {
		const receiver = to.address || to;
		const owner = await checkOwner();
		console.log("got owner from checkOwner(): ", owner);
		console.log("receiver: ", receiver);
		if (receiver === owner) {
			console.log("user === owner");
			return false;
		}
		await _nftContract.transferFrom(owner, receiver, 0, { from: owner });
		console.log(
			"token transferred, new owner: ",
			receiver,
			" = ",
			aliases[receiver]
		);
		return true;
	}

	describe("Testing Flow to a NFT", async function () {
		it("Case #6 - Random testing", async () => {
			try {
				//Creating the custom super token
				let tp = await _mainMint.mintSuperSocialToken(
					"SocialStream",
					"SS",
					1000000000 //How to send a big number
				);
				// console.log(tp);
			} catch (error) {
				console.log("Error while minting: " + error.message);
			}

			//Getting the address of the deployed super social token
			let ssA = await _mainMint.mySuperSocialTokenAddress.call({
				from: accounts[0],
			});
			console.log("Social Token Address: " + ssA);

			//Getting the balance of accounts[0]
			let dai = await sf.contracts.ISuperToken.at(ssA);
			console.log("SS 0: ", (await dai.balanceOf(accounts[0])).toString());
			console.log("SS 1: ", (await dai.balanceOf(accounts[1])).toString());
			console.log("SS 2: ", (await dai.balanceOf(accounts[1])).toString());
			// console.log(ssA);
			//Creating a NFT and transferring it to account 2
			let NFT = await _nftContract.safeMint(accounts[1], "This is a test mint");

			//Initiating a flow to the NFT
			// let flowcr = await _nftContract.createFlow(0, ssA, "385802469");

			//The code below runs and I am able to create the flow
			const user0 = sf.user({
				address: accounts[0],
				token: ssA, // address of the Super Token
			});

			await user0.flow({
				recipient: _nftContract.address,
				flowRate: "385802469",
				userData: 0,
			});

			await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME);
			console.log("SS 1: ", (await dai.balanceOf(accounts[1])).toString());
			// console.log(flowcr);
			console.log("Transferring NFT");
			await transferNFT(accounts[2]);
			await traveler.advanceTimeAndBlock(3600 * 2);
			console.log("SS 1: ", (await dai.balanceOf(accounts[1])).toString());
			console.log("SS 2: ", (await dai.balanceOf(accounts[2])).toString());
			console.log("SS 0: ", (await dai.balanceOf(accounts[0])).toString());
			await traveler.advanceTimeAndBlock(3600 * 2);
			console.log("SS 1: ", (await dai.balanceOf(accounts[1])).toString());
			console.log("SS 2: ", (await dai.balanceOf(accounts[2])).toString());
			console.log("SS 0: ", (await dai.balanceOf(accounts[0])).toString());
			await traveler.advanceTimeAndBlock(3600 * 2);
			console.log("SS 1: ", (await dai.balanceOf(accounts[1])).toString());
			console.log("SS 2: ", (await dai.balanceOf(accounts[2])).toString());
			console.log("SS 0: ", (await dai.balanceOf(accounts[0])).toString());
		});
	});
});
