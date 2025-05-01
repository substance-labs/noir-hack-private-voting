// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVerifier} from "./interfaces/IVerifier.sol";
import {IPrivateVoting} from "./interfaces/IPrivateVoting.sol";

contract PrivateVoting is IPrivateVoting, Ownable {
    mapping(uint256 => Vote) private _votes;
    mapping(uint256 => mapping(bytes32 => bool)) private _castedVotes;

    uint256 public numberOfVotes;

    bytes32 public immutable PUBLIC_KEY_HASH;
    bytes32 public immutable GENERATOR;
    IVerifier public immutable CAST_VOTE_VERIFIER;
    IVerifier public immutable REVEAL_VOTE_VERIFIER;

    constructor(bytes32 publicKeyHash, bytes32 generator, address castVoteVerifier, address revealVoteVerifier)
        Ownable(msg.sender)
    {
        PUBLIC_KEY_HASH = publicKeyHash;
        GENERATOR = generator;
        CAST_VOTE_VERIFIER = IVerifier(castVoteVerifier);
        REVEAL_VOTE_VERIFIER = IVerifier(revealVoteVerifier);
    }

    /// @inheritdoc IPrivateVoting
    function castVote(uint256 voteId, bytes32 c1, bytes32 c2, bytes calldata proof) external {
        Vote storage vote = _votes[voteId];
        require(vote.state == VoteState.Created, InvalidVoteState());
        require(vote.endBlock > block.number, VoteStillActive());

        // TODO: handle better double voting when zkpassport will be integrated
        /*bytes32 voterId = bytes32(0); // TODO
        require(!_castedVotes[voteId][voterId]);
        _castedVotes[voteId][voterId] = true;*/

        // How can i be sure that the user that casted the vote really wanted to vote in favour or not?
        // link between zkpassport proof and vote caster proof
        // the vote caster proof should also include the verification of the key linked to the passport

        bytes32[] memory publicInputs = new bytes32[](6);
        publicInputs[0] = GENERATOR;
        publicInputs[1] = PUBLIC_KEY_HASH;
        publicInputs[2] = vote.c1;
        publicInputs[3] = vote.c2;
        publicInputs[4] = c1;
        publicInputs[5] = c2;
        require(CAST_VOTE_VERIFIER.verify(proof, publicInputs), InvalidProof());

        vote.c1 = c1;
        vote.c2 = c2;
        numberOfVotes += 1;
        // ...

        emit VoteCasted(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function createVote(uint256 endBlock, uint256 minQuorum, string calldata description) external onlyOwner {
        uint256 voteId = numberOfVotes;
        _votes[voteId] =
            Vote(endBlock, minQuorum, bytes32(uint256(1)), bytes32(uint256(1)), 0, description, VoteState.Created);
        numberOfVotes++;
        emit VoteCreated(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function getVote(uint256 voteId) external view returns (Vote memory) {
        return _getVote(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function revealVote(uint256 voteId, uint256 decryptedSum, bytes calldata proof) external {
        Vote memory vote = _getVote(voteId);
        require(vote.endBlock <= block.number, VoteStillActive());
        require(vote.state == VoteState.Created, InvalidVoteState());

        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = GENERATOR;
        publicInputs[2] = vote.c1;
        publicInputs[3] = vote.c2;
        publicInputs[4] = bytes32(decryptedSum);
        require(REVEAL_VOTE_VERIFIER.verify(proof, publicInputs), InvalidProof());

        vote.state = VoteState.Revealed;
        vote.result = decryptedSum;

        emit VoteRevealed(voteId);
    }

    /// @inheritdoc IPrivateVoting
    function hasVoted(uint256 voteId, bytes32 voterId) external view returns (bool) {
        return _castedVotes[voteId][voterId];
    }

    function _getVote(uint256 voteId) internal view returns (Vote storage) {
        Vote storage vote = _votes[voteId];
        require(vote.endBlock != 0, VoteDoesNotExist());
        return vote;
    }
}
