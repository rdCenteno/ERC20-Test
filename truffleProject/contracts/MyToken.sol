import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.6.2;

contract MyToken is ERC20, Ownable {

    uint256 constant INITIAL_BALANCE = 100;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) public {}

    function addBalanceToUser(address user) public onlyOwner {
        require(user != address(0));
        _mint(user, INITIAL_BALANCE * 10 ** uint(decimals()));
    }
 
    function getInitialBalance() public view returns (uint256) {
        return INITIAL_BALANCE * 10 ** uint(decimals());
    }
}

