// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPrivateVoting} from "./interfaces/IPrivateVoting.sol";

contract PrivateVoting is IPrivateVoting, Ownable {
    mapping(uint256 => Vote) private _votes;

    uint256 public numberOfVotes;

    constructor() Ownable(msg.sender) {}

    /// @inheritdoc IPrivateVoting
    function createVote(uint256 endBlock, uint256 minQuorum, string calldata description) external onlyOwner {
        uint256 voteId = numberOfVotes;
        _votes[voteId] = Vote(endBlock, minQuorum, 0, 0, 0, description, VoteState.Created);
        numberOfVotes++;
        emit VoteCreated(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function getVote(uint256 voteId) external view returns (Vote memory) {
        return _getVote(voteId);
    }

    function _getVote(uint256 voteId) internal view returns (Vote storage) {
        Vote storage vote = _votes[voteId];
        if (vote.endBlock == 0) revert VoteDoesNotExist();
        return vote;
    }
}
