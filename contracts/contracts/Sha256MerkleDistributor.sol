// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Sha256MerkleDistributor (Base Sepolia)
 * @notice 使用 SHA-256 的 Merkle Distributor（与 Workers/浏览器一致）
 *         leaf = sha256(abi.encodePacked(index, account, amount))
 *         node = sha256(sorted(children))
 * @dev    演示使用原生币发放；生产可改为 ERC20/NFT。
 */
contract Sha256MerkleDistributor {
    address public owner;
    bytes32 public merkleRoot;
    mapping(uint256 => uint256) private claimedBitMap;

    event OwnershipTransferred(address indexed prev, address indexed next);
    event RootUpdated(bytes32 indexed root);
    event Claimed(uint256 indexed index, address indexed account, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(bytes32 _root) payable {
        owner = msg.sender;
        merkleRoot = _root;
        emit OwnershipTransferred(address(0), msg.sender);
        emit RootUpdated(_root);
    }

    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "ZERO");
        emit OwnershipTransferred(owner, next);
        owner = next;
    }

    function setRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
        emit RootUpdated(_root);
    }

    function isClaimed(uint256 index) public view returns (bool) {
        uint256 wordIndex = index >> 8;       // / 256
        uint256 bitIndex  = index & 255;      // % 256
        uint256 word = claimedBitMap[wordIndex];
        uint256 mask = (1 << bitIndex);
        return (word & mask) == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 wordIndex = index >> 8;
        uint256 bitIndex  = index & 255;
        claimedBitMap[wordIndex] = claimedBitMap[wordIndex] | (1 << bitIndex);
    }

    function _verify(bytes32[] memory proof, bytes32 leaf) internal view returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i=0; i<proof.length; i++){
            bytes32 sibling = proof[i];
            if (computedHash <= sibling) {
                computedHash = sha256(abi.encodePacked(computedHash, sibling));
            } else {
                computedHash = sha256(abi.encodePacked(sibling, computedHash));
            }
        }
        return computedHash == merkleRoot;
    }

    function leafOf(uint256 index, address account, uint256 amount) public pure returns (bytes32) {
        return sha256(abi.encodePacked(index, account, amount));
    }

    function claim(uint256 index, address payable account, uint256 amount, bytes32[] calldata proof) external {
        require(!isClaimed(index), "CLAIMED");
        bytes32 leaf = leafOf(index, account, amount);
        require(_verify(proof, leaf), "BAD_PROOF");

        _setClaimed(index);
        (bool ok, ) = account.call{value: amount}("");
        require(ok, "TRANSFER_FAIL");

        emit Claimed(index, account, amount);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "WITHDRAW_FAIL");
    }

    receive() external payable {}
}