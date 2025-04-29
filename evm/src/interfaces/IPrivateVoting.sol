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
        bytes32 cypSum;
        bytes32 randomness;
        uint256 result;
        string description;
        VoteState state;
    }

    event VoteCasted(uint256 indexed voteId);
    event VoteCreated(uint256 indexed voteId);

    error InvalidProof();
    error VoteDoesNotExist();

    function castVote(uint256 voteId, bytes32 cypNewVotesSum, bytes32 newVoteRandomness, bytes calldata proof)
        external;

    function createVote(uint256 endBlock, uint256 minQuorum, string calldata description) external;

    function getVote(uint256 voteId) external view returns (Vote memory);

    function hasVoted(uint256 voteId, bytes32 voterId) external view returns (bool);
}
