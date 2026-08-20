// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Host} from "../src/Host.sol";

/// @notice Deploy THE HOST to Robinhood Chain.
///
///   forge script script/Deploy.s.sol --rpc-url rh_testnet --broadcast
///   forge script script/Deploy.s.sol --rpc-url rh_mainnet --broadcast
///
/// Requires PRIVATE_KEY. Set HOST_TREASURY, HOST_ROYALTY, HOST_BASE_URI in env
/// (royalty may equal treasury). Never commit keys.
contract Deploy is Script {
    function run() external returns (Host host) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address payable treasury = payable(vm.envAddress("HOST_TREASURY"));
        address royalty = vm.envAddress("HOST_ROYALTY");
        string memory baseURI = vm.envString("HOST_BASE_URI");

        vm.startBroadcast(pk);
        host = new Host(treasury, royalty, baseURI);
        vm.stopBroadcast();

        console.log("HOST", address(host));
        console.log("treasury", treasury);
        console.log("royalty", royalty);
    }
}
