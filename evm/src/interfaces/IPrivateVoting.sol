// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

interface IPrivateVoting {
    enum VoteState {
        NotCreated,
        Created,
        RequestedToReveal,
        Revealed
    }

    struct Vote {
        uint256 endBlock;
        uint256 minQuorum;
        uint256 encryptedResult;
        uint256 result;
        uint256 voteCount;
        string description;
        VoteState state;
    }

    event VoteCreated(uint256 indexed voteId);

    error VoteDoesNotExist();

    function createVote(uint256 endBlock, uint256 minQuorum, string calldata description) external;

    function getVote(uint256 voteId) external view returns (Vote memory);
}
