// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC20MerkleDistributor
 * @dev 使用 Merkle Tree 分发 ERC20 代币
 */
contract ERC20MerkleDistributor is Ownable {
    // 代币合约地址
    address public immutable token;
    
    // Merkle Root
    bytes32 public immutable merkleRoot;
    
    // 记录已领取的地址（使用 bitmap 节省 gas）
    mapping(uint256 => uint256) private claimedBitMap;
    
    // 事件
    event Claimed(uint256 index, address account, uint256 amount);
    
    constructor(address token_, bytes32 merkleRoot_) Ownable(msg.sender) {
        token = token_;
        merkleRoot = merkleRoot_;
    }
    
    /**
     * @dev 检查某个索引是否已领取
     */
    function isClaimed(uint256 index) public view returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }
    
    /**
     * @dev 设置已领取状态
     */
    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }
    
    /**
     * @dev 用户领取代币
     * @param index 用户在 Merkle Tree 中的索引
     * @param account 领取地址
     * @param amount 领取数量
     * @param merkleProof Merkle 证明
     */
    function claim(
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(!isClaimed(index), "ERC20MerkleDistributor: Drop already claimed");
        
        // 验证 Merkle Proof
        bytes32 node = keccak256(bytes.concat(keccak256(abi.encode(index, account, amount))));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, node),
            "ERC20MerkleDistributor: Invalid proof"
        );
        
        // 标记为已领取
        _setClaimed(index);
        
        // 转账代币
        require(
            IERC20(token).transfer(account, amount),
            "ERC20MerkleDistributor: Transfer failed"
        );
        
        emit Claimed(index, account, amount);
    }
    
    /**
     * @dev 提取剩余代币（仅 owner）
     */
    function withdrawRemaining(address to) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(
            IERC20(token).transfer(to, balance),
            "ERC20MerkleDistributor: Withdraw failed"
        );
    }
}

