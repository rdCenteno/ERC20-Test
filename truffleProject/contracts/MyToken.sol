import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.6.2;

contract MyToken is ERC20, Ownable {

    constructor(string memory name, string memory symbol) ERC20(name, symbol) public {}

    function addBalanceToUser(address user, uint256 initialBalance) public onlyOwner {
        require(user != address(0));
        _mint(user, initialBalance * 10 ** uint(decimals()));
    }
}

