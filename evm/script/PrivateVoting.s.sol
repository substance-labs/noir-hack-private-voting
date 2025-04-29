// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PrivateVoting} from "../src/PrivateVoting.sol";

contract PrivateVotingScript is Script {
    PrivateVoting public counter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        counter = new PrivateVoting();

        vm.stopBroadcast();
    }
}
