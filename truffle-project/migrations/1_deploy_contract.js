const MyToken = artifacts.require("./MyToken.sol");

const TOKEN_NAME = "TOKEN_TEST";
const SYMBOL = "TT";

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(MyToken, TOKEN_NAME, SYMBOL);
};
