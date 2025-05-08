// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {Revelio} from "../src/Revelio.sol";
import {CastVoteVerifier} from "../src/verifiers/CastVoteVerifier.sol";

contract RevelioTest is Test {
    Revelio public revelio;
    CastVoteVerifier public castVoteVerifier;

    function setUp() public {
        castVoteVerifier = new CastVoteVerifier();

        bytes32 publicKeyHash = 0x22f162a4e96080597d7c32dffe2d6beee811fe65cbf4774850fd51d41550ca7e;
        bytes32 generator = bytes32(uint256(2));
        revelio = new Revelio(publicKeyHash, generator, address(castVoteVerifier));
    }

    function test_cast_vote() public {
        uint256 endBlock = block.number + 1000;
        uint256 minQuorum = 500000000000000000; // 0.5 -> 50%
        uint256 nOptions = 5;
        string memory description = "bla bla bla";
        revelio.createVote(endBlock, minQuorum, nOptions, description);

        uint256 voteId = 0;
        uint256[] memory intention = new uint256[](nOptions); // this is a private input
        uint256[] memory votesRandomness = new uint256[](nOptions); // this is a private input

        for (uint256 i = 0; i < nOptions; i++) {
            intention[i] = i == 0 ? 1 : 0;
            votesRandomness[i] = i + 1;
        }

        string[] memory inputs = new string[](3);
        inputs[0] = "sh";
        inputs[1] = "-c";
        inputs[2] = string.concat(
            "node provers/cast-vote.js ",
            iToHex(abi.encodePacked(revelio.GENERATOR())),
            " ",
            iToHex(abi.encodePacked(bytes2(0x0400))), // pub key
            " ",
            iToHex(abi.encodePacked(revelio.PUBLIC_KEY_HASH())),
            " ",
            iToHex(abi.encodePacked(intention)),
            " ",
            iToHex(abi.encodePacked(votesRandomness))
        );

        bytes memory result = vm.ffi(inputs);
        (uint256[] memory c1s, uint256[] memory c2s, bytes memory proof) =
            abi.decode(result, (uint256[], uint256[], bytes));
        revelio.castVote(voteId, c1s, c2s, proof);
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
