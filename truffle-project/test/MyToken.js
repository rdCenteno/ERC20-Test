const { constants, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { ZERO_ADDRESS } = constants;

const MyToken = artifacts.require("./MyToken.sol");

const INITIAL_BALANCE = 20;

contract("MyToken test", async accounts => {

    const [owner, other] = accounts;
    let myToken;

    beforeEach(async () => {
        myToken = await MyToken.deployed();
    });

    it("Should check that the owner is right", async () => {
        let expectedOwner = await myToken.owner();
        assert.equal(expectedOwner, owner, "The owner is not right");
    });

    describe("add balance to user", () => {

        it("add balance", async () => {
            const { logs } = await myToken.addBalanceToUser(other, INITIAL_BALANCE, { from: owner });
            const userBalance = await myToken.balanceOf(other);

            const event = expectEvent.inLogs(logs, "Transfer", {
                from: ZERO_ADDRESS,
                to: other,
            });

            assert.equal(event.args.value.toString(), userBalance.toString(), "The expected balance is wrong");
        });

        it("creates a", async () => {
            await expectRevert(
                myToken.addBalanceToUser(owner, INITIAL_BALANCE, { from: other }),
                "Ownable: caller is not the owner",
            );
        });

    });

    describe("creates a new account and add initial balance", () => {
        it("creates a new account", async () => {
            const sender = web3.eth.accounts.create(web3.utils.randomHex(32));
            await myToken.addBalanceToUser(sender.address, INITIAL_BALANCE, { from: owner });
            const userBalance = await myToken.balanceOf(sender.address);
            assert.equal(web3.utils.toWei(INITIAL_BALANCE.toString(), "ether"), userBalance.toString(), "The expected balance is wrong");
        });
    });

});
