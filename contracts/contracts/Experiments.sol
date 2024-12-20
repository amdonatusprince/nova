// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing OpenZeppelin's ERC721 and ERC721URIStorage
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract Experiments is ERC721URIStorage, Ownable {
    uint256 private _currentTokenId;
    IERC20 private NOVA; // Reference to the ERC-20 token contract
    uint256 private constant TOKENS_PER_MINT = 100 * 10**18; // 100 tokens with 18 decimals

    // Constructor to set the name and symbol of the NFT collection
    constructor() ERC721("NOVA Experiments", "sNOVA") Ownable(msg.sender) {}

    function setNOVA(address novaAddress) public onlyOwner {
        NOVA = IERC20(novaAddress);
    }

    // Mint function to create a new NFT with a specific URI
    function mint(address to, string memory tokenURI) public {
        // Increment the token ID
        _currentTokenId += 1;

        // Mint the new token to the 'to' address
        _safeMint(to, _currentTokenId);

        // Set the token URI for the minted token
        _setTokenURI(_currentTokenId, tokenURI);

        // Transfer 10 ERC-20 tokens to the 'to' address
        require(NOVA.transfer(to, TOKENS_PER_MINT), "ERC-20 transfer failed");
    }
}