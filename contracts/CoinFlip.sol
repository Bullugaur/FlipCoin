pragma solidity ^0.8.0;

contract CoinFlip {
    event Result(bool win);

    function flipCoin(bool _guess) public payable returns (bool) {
        require(msg.value > 0, "You need to send some ether to play");

        bool win = (block.timestamp % 2 == 0) == _guess;

        if (win) {
            payable(msg.sender).transfer(msg.value * 2);
        }

        emit Result(win);

        return win;
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
