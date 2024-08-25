require("@nomiclabs/hardhat-ethers");

module.exports = {
    solidity: "0.8.4",
    networks: {
        sepolia: {
            url: process.env.INFURA_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },

};