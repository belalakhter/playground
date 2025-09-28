// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AirdropToken is ERC20, Ownable {
    uint256 public tokenPrice;
    uint256 public maxSupply;
    uint256 public tokensSold;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 supply_,
        uint256 pricePerTokenWei
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        maxSupply = supply_;
        tokenPrice = pricePerTokenWei;

        _mint(address(this), supply_);
    }
    function decimals() public pure override returns (uint8) {
            return 0;
    }

    function buyTokens(uint256 amount) external payable {
        require(amount > 0, "Amount must be > 0");
        require(balanceOf(address(this)) >= amount, "Not enough tokens left");

        uint256 cost = amount * tokenPrice;
        require(msg.value >= cost, "Insufficient ETH sent");

        tokensSold += amount;


        _transfer(address(this), msg.sender, amount);


        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    function remainingTokens() external view returns (uint256) {
        return balanceOf(address(this));
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
