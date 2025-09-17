// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProReviewerBadge
 * @dev Minimal ERC-721 contract that lets community members mint a single
 *      "Pro Reviewer" badge NFT. Owners can also mint badges manually when needed.
 */
contract ProReviewerBadge is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    mapping(address => bool) public hasMinted;

    event BadgeMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner)
        ERC721("FoodChain Pro Reviewer", "FPR")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mint a badge to the caller. Each wallet can mint exactly once.
     * @param tokenURI Full metadata URI (e.g. IPFS/HTTPS) describing the badge artwork.
     * @return tokenId Newly minted token ID.
     */
    function mintProReviewer(string calldata tokenURI) external returns (uint256 tokenId) {
        require(!hasMinted[msg.sender], "Badge already claimed");

        hasMinted[msg.sender] = true;
        tokenId = _mintBadge(msg.sender, tokenURI);
    }

    /**
     * @notice Owner helper for custom badge distribution.
     */
    function ownerMint(address to, string calldata tokenURI)
        external
        onlyOwner
        returns (uint256 tokenId)
    {
        tokenId = _mintBadge(to, tokenURI);
    }

    function _mintBadge(address to, string calldata tokenURI)
        internal
        returns (uint256 tokenId)
    {
        tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit BadgeMinted(to, tokenId, tokenURI);
    }
}
