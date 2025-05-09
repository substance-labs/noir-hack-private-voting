// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

interface IRevelio {
    enum VoteState {
        NotCreated,
        Created,
        Revealed
    }

    struct Vote {
        uint256 endBlock;
        uint256 minQuorum;
        uint256 numberOfVotes;
        uint256[] c1s;
        uint256[] c2s;
        uint256[] result;
        string ref;
        VoteState state;
    }

    event VoteCasted(uint256 indexed voteId);
    event VoteCreated(uint256 indexed voteId);
    event VoteRevealed(uint256 indexed voteId);

    error InvalidProof();
    error InvalidVoteState();
    error ValueExceedsFieldSize();
    error VoteDoesNotExist();
    error VoteStillActive();

    function castVote(uint256 voteId, uint256[] calldata c1s, uint256[] calldata c2s, bytes calldata proof) external;

    function createVote(uint256 endBlock, uint256 minQuorum, uint256 nOptions, string calldata ref) external;

    function getVote(uint256 voteId) external view returns (Vote memory);

    function hasVoted(uint256 voteId, bytes32 voterId) external view returns (bool);

    function revealVote(uint256 voteId) external;
}
