// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVerifier} from "./Verifier.sol";
import {IPrivateVoting} from "./interfaces/IPrivateVoting.sol";

contract PrivateVoting is IPrivateVoting, Ownable {
    mapping(uint256 => Vote) private _votes;
    mapping(uint256 => mapping(bytes32 => bool)) private _castedVotes;

    uint256 public numberOfVotes;

    bytes32 public immutable PUBLIC_KEY_HASH;
    bytes32 public immutable GENERATOR;
    IVerifier public immutable VERIFIER;

    constructor(bytes32 publicKeyHash, bytes32 generator, address verifier) Ownable(msg.sender) {
        PUBLIC_KEY_HASH = publicKeyHash;
        GENERATOR = generator;
        VERIFIER = IVerifier(verifier);
    }

    /// @inheritdoc IPrivateVoting
    function castVote(uint256 voteId, bytes32 cypNewVotesSum, bytes32 newVoteRandomness, bytes calldata proof)
        external
    {
        // TODO: handle better double voting when zkpassport will be integrated
        /*bytes32 voterId = bytes32(0); // TODO
        require(!_castedVotes[voteId][voterId]);
        _castedVotes[voteId][voterId] = true;*/

        Vote storage vote = _votes[voteId];
        if (vote.endBlock == 0) revert VoteDoesNotExist();

        bytes32[] memory publicInputs = new bytes32[](6);
        publicInputs[0] = GENERATOR;
        publicInputs[1] = PUBLIC_KEY_HASH;
        publicInputs[2] = vote.randomness; // current randomness
        publicInputs[3] = vote.cypSum; // current encrypted sum
        publicInputs[4] = cypNewVotesSum; // new encrypted sum
        publicInputs[5] = newVoteRandomness; // new randomness
        require(VERIFIER.verify(proof, publicInputs), InvalidProof());

        vote.cypSum = cypNewVotesSum;
        vote.randomness = newVoteRandomness;
        numberOfVotes += 1;
        // ...

        emit VoteCasted(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function createVote(uint256 endBlock, uint256 minQuorum, string calldata description) external onlyOwner {
        uint256 voteId = numberOfVotes;
        _votes[voteId] = Vote(endBlock, minQuorum, bytes32(0), bytes32(0), 0, description, VoteState.Created);
        numberOfVotes++;
        emit VoteCreated(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function getVote(uint256 voteId) external view returns (Vote memory) {
        return _getVote(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function hasVoted(uint256 voteId, bytes32 voterId) external view returns (bool) {
        return _castedVotes[voteId][voterId];
    }

    function _getVote(uint256 voteId) internal view returns (Vote storage) {
        Vote storage vote = _votes[voteId];
        if (vote.endBlock == 0) revert VoteDoesNotExist();
        return vote;
    }
}
