// scripts/deploy.js
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Use the contract name as defined in your Solidity file
    const CoinFlipFactory = await ethers.getContractFactory("CoinFlip");
    const coinFlip = await CoinFlipFactory.deploy();

    console.log("Contract deployed to address:", coinFlip.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });