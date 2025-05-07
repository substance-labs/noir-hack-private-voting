// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Elgamal} from "./libraries/Elgamal.sol";
import {IVerifier} from "./interfaces/IVerifier.sol";
import {IRevelio} from "./interfaces/IRevelio.sol";

contract Revelio is IRevelio, Ownable {
    mapping(uint256 => Vote) private _votes;
    mapping(uint256 => mapping(bytes32 => bool)) private _castedVotes;

    uint256 public numberOfVotes;

    bytes32 public immutable PUBLIC_KEY_HASH;
    bytes32 public immutable GENERATOR;
    IVerifier public immutable CAST_VOTE_VERIFIER;

    constructor(bytes32 publicKeyHash, bytes32 generator, address castVoteVerifier) Ownable(msg.sender) {
        PUBLIC_KEY_HASH = publicKeyHash;
        GENERATOR = generator;
        CAST_VOTE_VERIFIER = IVerifier(castVoteVerifier);
    }

    /// @inheritdoc IRevelio
    function castVote(uint256 voteId, uint256 c1, uint256 c2, bytes calldata proof) external {
        Vote storage vote = _votes[voteId];
        require(vote.state == VoteState.Created, InvalidVoteState());
        require(vote.endBlock > block.number, VoteStillActive());

        // TODO: handle better double voting when zkpassport will be integrated
        /*bytes32 voterId = bytes32(0); // TODO
        require(!_castedVotes[voteId][voterId]);
        _castedVotes[voteId][voterId] = true;*/

        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = GENERATOR;
        publicInputs[1] = PUBLIC_KEY_HASH;
        publicInputs[2] = bytes32(c1);
        publicInputs[3] = bytes32(c2);
        require(CAST_VOTE_VERIFIER.verify(proof, publicInputs), InvalidProof());

        (uint256 newC1, uint256 newC2) = Elgamal.aggregate(vote.c1, vote.c2, c1, c2);
        vote.c1 = newC1;
        vote.c2 = newC2;
        vote.numberOfVotes++;

        emit VoteCasted(voteId);
    }

    /// @inheritdoc IRevelio
    function createVote(uint256 endBlock, uint256 minQuorum, string calldata ref) external onlyOwner {
        uint256 voteId = numberOfVotes;
        _votes[voteId] = Vote(endBlock, minQuorum, 0, 1, 1, 0, ref, VoteState.Created);
        numberOfVotes++;
        emit VoteCreated(voteId);
    }

    /// @inheritdoc IRevelio
    function getVote(uint256 voteId) external view returns (Vote memory) {
        return _getVote(voteId);
    }

    /// @inheritdoc IRevelio
    function revealVote(uint256 voteId) external {
        // TODO
        emit VoteRevealed(voteId);
    }

    /// @inheritdoc IRevelio
    function hasVoted(uint256 voteId, bytes32 voterId) external view returns (bool) {
        return _castedVotes[voteId][voterId];
    }

    function _getVote(uint256 voteId) internal view returns (Vote storage) {
        Vote storage vote = _votes[voteId];
        require(vote.endBlock != 0, VoteDoesNotExist());
        return vote;
    }
}
