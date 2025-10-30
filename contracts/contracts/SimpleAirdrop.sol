// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleAirdrop
 * @dev 简化的空投合约 - 不使用复杂的 Merkle Tree 验证
 * 适合签到后即可领取的场景
 */
contract SimpleAirdrop is Ownable {
    IERC20 public token;
    uint256 public amountPerClaim;
    bytes32 public eventId;
    
    // 记录已领取的地址
    mapping(address => bool) public hasClaimed;
    
    // 记录授权的签名者（后端服务）
    address public signer;
    
    event Claimed(address indexed account, uint256 amount);
    event SignerUpdated(address indexed newSigner);
    event AmountUpdated(uint256 newAmount);
    
    constructor(
        address token_,
        uint256 amountPerClaim_,
        bytes32 eventId_,
        address signer_
    ) Ownable(msg.sender) {
        token = IERC20(token_);
        amountPerClaim = amountPerClaim_;
        eventId = eventId_;
        signer = signer_;
    }
    
    /**
     * @dev 用户领取代币
     * @param signature 后端签名，证明用户已签到
     */
    function claim(bytes memory signature) external {
        require(!hasClaimed[msg.sender], "Already claimed");
        
        // 验证签名
        bytes32 message = keccak256(abi.encodePacked(eventId, msg.sender, amountPerClaim));
        bytes32 ethSignedMessage = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        address recovered = recoverSigner(ethSignedMessage, signature);
        
        require(recovered == signer, "Invalid signature");
        
        // 标记为已领取
        hasClaimed[msg.sender] = true;
        
        // 转账代币
        require(token.transfer(msg.sender, amountPerClaim), "Transfer failed");
        
        emit Claimed(msg.sender, amountPerClaim);
    }
    
    /**
     * @dev 恢复签名者地址
     */
    function recoverSigner(bytes32 ethSignedMessage, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature v value");
        
        return ecrecover(ethSignedMessage, v, r, s);
    }
    
    /**
     * @dev 更新签名者地址（仅管理员）
     */
    function updateSigner(address newSigner) external onlyOwner {
        signer = newSigner;
        emit SignerUpdated(newSigner);
    }
    
    /**
     * @dev 更新每次领取金额（仅管理员）
     */
    function updateAmount(uint256 newAmount) external onlyOwner {
        amountPerClaim = newAmount;
        emit AmountUpdated(newAmount);
    }
    
    /**
     * @dev 提取剩余代币（仅管理员）
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
    }
    
    /**
     * @dev 检查地址是否已领取
     */
    function isClaimed(address account) external view returns (bool) {
        return hasClaimed[account];
    }
}

