// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Host} from "../src/Host.sol";

contract HostTest is Test {
    Host host;
    address payable treasury = payable(address(0xA11CE));
    address royalty = address(0xB0B);
    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        host = new Host(treasury, royalty, "ipfs://CID/");
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testMintPaysTreasuryAndSetsOwner() public {
        uint256 before = treasury.balance;
        vm.prank(alice);
        host.mint{value: 0.0005 ether}();
        assertEq(host.ownerOf(1), alice);
        assertEq(host.totalMinted(), 1);
        assertEq(treasury.balance, before + 0.0005 ether);
        assertEq(address(host).balance, 0);
    }

    function testWrongPriceReverts() public {
        vm.prank(alice);
        vm.expectRevert(Host.WrongPrice.selector);
        host.mint{value: 0.0004 ether}();
    }

    function testWalletCap() public {
        vm.startPrank(alice);
        host.mint{value: 0.0005 ether}();
        host.mint{value: 0.0005 ether}();
        host.mint{value: 0.0005 ether}();
        vm.expectRevert(Host.WalletCap.selector);
        host.mint{value: 0.0005 ether}();
        vm.stopPrank();
    }

    function testSupplyCap() public {
        for (uint256 i; i < 333; ++i) {
            address w = address(uint160(1000 + i));
            vm.deal(w, 1 ether);
            vm.prank(w);
            host.mint{value: 0.0005 ether}();
        }
        assertEq(host.totalMinted(), 333);
        vm.prank(bob);
        vm.expectRevert(Host.SoldOut.selector);
        host.mint{value: 0.0005 ether}();
    }

    function testRoyaltyFivePercent() public {
        (address recv, uint256 amt) = host.royaltyInfo(1, 1 ether);
        assertEq(recv, royalty);
        assertEq(amt, 0.05 ether);
    }

    function testTokenURI() public {
        vm.prank(alice);
        host.mint{value: 0.0005 ether}();
        assertEq(host.tokenURI(1), "ipfs://CID/1.json");
    }

    function testFreezeURI() public {
        vm.prank(treasury);
        host.freezeURI();
        vm.prank(treasury);
        vm.expectRevert(Host.URIIsFrozen.selector);
        host.setBaseURI("ipfs://NOPE/");
    }

    function testSupports2981() public {
        assertTrue(host.supportsInterface(0x2a55205a));
    }
}
