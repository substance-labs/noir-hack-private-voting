// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Revelio} from "../src/Revelio.sol";

contract RevelioScript is Script {
    Revelio public revelio;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // revelio = new Revelio();

        vm.stopBroadcast();
    }
}
