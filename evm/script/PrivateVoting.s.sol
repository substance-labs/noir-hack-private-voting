// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PrivateVoting} from "../src/PrivateVoting.sol";

contract PrivateVotingScript is Script {
    PrivateVoting public privateVoting;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // privateVoting = new PrivateVoting();

        vm.stopBroadcast();
    }
}
