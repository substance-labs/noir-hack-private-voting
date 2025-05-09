// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library Elgamal {
    uint256 constant P = 21888242871839275222246405745257275088548364400416034343698204186575808495617; // Prime modulus used in Noir

    function aggregate(uint256 c11, uint256 c21, uint256 c12, uint256 c22) internal pure returns (uint256, uint256) {
        return (mulmod(c11, c12, P), mulmod(c21, c22, P));
    }
}
