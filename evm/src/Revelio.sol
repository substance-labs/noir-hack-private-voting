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
    function castVote(uint256 voteId, uint256[] calldata c1s, uint256[] calldata c2s, bytes calldata proof) external {
        Vote storage vote = _votes[voteId];
        require(vote.state == VoteState.Created, InvalidVoteState());
        require(vote.endBlock > block.number, VoteStillActive());

        // TODO: handle better double voting when zkpassport will be integrated
        /*bytes32 voterId = bytes32(0); // TODO
        require(!_castedVotes[voteId][voterId]);
        _castedVotes[voteId][voterId] = true;*/

        uint256 nOptions = vote.c1s.length;
        bytes32[] memory publicInputs = new bytes32[](2 + (2 * nOptions));
        publicInputs[0] = GENERATOR;
        publicInputs[1] = PUBLIC_KEY_HASH;
        for (uint256 i = 0; i < nOptions; i++) {
            publicInputs[2 + i] = bytes32(c1s[i]);
            publicInputs[2 + nOptions + i] = bytes32(c2s[i]);
        }

        require(CAST_VOTE_VERIFIER.verify(proof, publicInputs), InvalidProof());

        require(c1s.length == c2s.length && c1s.length == nOptions);
        for (uint256 i = 0; i < c1s.length; i++) {
            require(c1s[i] < Elgamal.P && c2s[i] < Elgamal.P, ValueExceedsFieldSize());
            (uint256 c1, uint256 c2) = Elgamal.aggregate(vote.c1s[i], vote.c2s[i], c1s[i], c2s[i]);
            vote.c1s[i] = c1;
            vote.c2s[i] = c2;
        }
        vote.numberOfVotes++;

        emit VoteCasted(voteId);
    }

    /// @inheritdoc IRevelio
    function createVote(uint256 endBlock, uint256 minQuorum, uint256 nOptions, string calldata ref)
        external
        onlyOwner
    {
        uint256 voteId = numberOfVotes;

        uint256[] memory result = new uint256[](nOptions);
        uint256[] memory c1s = new uint256[](nOptions);
        uint256[] memory c2s = new uint256[](nOptions);
        for (uint256 i = 0; i < nOptions; i++) {
            c1s[i] = 0;
            c2s[i] = 0;
        }

        _votes[voteId] = Vote(endBlock, minQuorum, 0, c1s, c2s, result, ref, VoteState.Created);
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
