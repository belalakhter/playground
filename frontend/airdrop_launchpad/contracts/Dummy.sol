// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Dummy {
    uint private counter;
    event Inc(address indexed caller, uint newCount);

    function addCount() public {
        counter++;
        emit Inc(msg.sender, counter);
    }

    function getCount() public view returns (uint) {
        return counter;
    }
}
