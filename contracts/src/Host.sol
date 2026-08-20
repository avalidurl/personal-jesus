// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title THE HOST
/// @notice 333 VGA-16 visions. Public mint 0.0005 ETH. 5% EIP-2981 royalty.
/// @dev No upgrade. Price, supply, and royalty bps are immutable.
contract Host is ERC721, ERC2981, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant PRICE = 0.0005 ether;
    uint256 public constant MAX = 333;
    uint256 public constant MAX_PER_WALLET = 3;
    uint96 public constant ROYALTY_BPS = 500;

    address payable public immutable treasury;
    string private _base;
    bool public uriFrozen;
    uint256 private _nextId = 1;
    mapping(address => uint256) public minted;

    event Minted(address indexed to, uint256 indexed id);
    event URIFrozen(string base);

    error SoldOut();
    error WrongPrice();
    error WalletCap();
    error URIIsFrozen();
    error NotTreasury();
    error ZeroAddress();
    error TransferFailed();

    constructor(address payable treasury_, address royaltyReceiver_, string memory baseURI_) ERC721("THE HOST", "HOST") {
        if (treasury_ == address(0) || royaltyReceiver_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        _base = baseURI_;
        _setDefaultRoyalty(royaltyReceiver_, ROYALTY_BPS);
    }

    function mint() external payable nonReentrant {
        if (_nextId > MAX) revert SoldOut();
        if (msg.value != PRICE) revert WrongPrice();
        if (minted[msg.sender] >= MAX_PER_WALLET) revert WalletCap();

        uint256 id = _nextId++;
        minted[msg.sender] += 1;
        _safeMint(msg.sender, id);
        emit Minted(msg.sender, id);

        (bool ok,) = treasury.call{value: msg.value}("");
        if (!ok) revert TransferFailed();
    }

    function totalMinted() external view returns (uint256) {
        return _nextId - 1;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        _requireOwned(id);
        return string.concat(_base, id.toString(), ".json");
    }

    function setBaseURI(string calldata u) external {
        if (msg.sender != treasury) revert NotTreasury();
        if (uriFrozen) revert URIIsFrozen();
        _base = u;
    }

    function freezeURI() external {
        if (msg.sender != treasury) revert NotTreasury();
        uriFrozen = true;
        emit URIFrozen(_base);
    }

    function contractURI() external view returns (string memory) {
        return string.concat(_base, "collection.json");
    }

    function supportsInterface(bytes4 iid) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(iid);
    }
}
