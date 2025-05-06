// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PrivateVoting} from "../src/PrivateVoting.sol";
import {CastVoteVerifier} from "../src/verifiers/CastVoteVerifier.sol";

contract PrivateVotingTest is Test {
    PrivateVoting public privateVoting;
    CastVoteVerifier public castVoteVerifier;

    function setUp() public {
        castVoteVerifier = new CastVoteVerifier();

        bytes32 publicKeyHash = 0x22f162a4e96080597d7c32dffe2d6beee811fe65cbf4774850fd51d41550ca7e;
        bytes32 generator = bytes32(uint256(2));
        privateVoting = new PrivateVoting(publicKeyHash, generator, address(castVoteVerifier));
    }

    function test_cast_vote() public {
        uint256 endBlock = block.number + 1000;
        uint256 minQuorum = 500000000000000000; // 0.5 -> 50%
        string memory description = "bla bla bla";
        privateVoting.createVote(endBlock, minQuorum, description);

        uint256 voteId = 0;
        uint256 intention = 1; // this is a private input
        uint256 voteRandomness = block.number; // this is a private input

        string[] memory inputs = new string[](3);
        inputs[0] = "sh";
        inputs[1] = "-c";
        inputs[2] = string.concat(
            "node provers/cast-vote.js ",
            iToHex(abi.encodePacked(privateVoting.GENERATOR())),
            " ",
            iToHex(abi.encodePacked(bytes2(0x0400))), // pub key
            " ",
            iToHex(abi.encodePacked(privateVoting.PUBLIC_KEY_HASH())),
            " ",
            iToHex(abi.encodePacked(intention)),
            " ",
            iToHex(abi.encodePacked(voteRandomness))
        );

        bytes memory result = vm.ffi(inputs);
        (uint256 c1, uint256 c2, bytes memory proof) = abi.decode(result, (uint256, uint256, bytes));
        privateVoting.castVote(voteId, c1, c2, proof);
    }

    function iToHex(bytes memory buffer) public pure returns (string memory) {
        bytes memory converted = new bytes(buffer.length * 2);
        bytes memory _base = "0123456789abcdef";
        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }
        return string(abi.encodePacked("0x", converted));
    }
}
