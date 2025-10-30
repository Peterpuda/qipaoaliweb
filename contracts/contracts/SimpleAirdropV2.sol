// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleAirdropV2
 * @dev 更简单的空投合约 - 基于链下验证
 * 用户签到后，后端记录资格，用户直接调用 claim() 即可
 * 合约通过事件让后端验证，防止重复领取
 */
contract SimpleAirdropV2 is Ownable {
    IERC20 public token;
    uint256 public amountPerClaim;
    bytes32 public eventId;
    
    // 记录已领取的地址
    mapping(address => bool) public hasClaimed;
    
    // 记录领取次数
    uint256 public totalClaims;
    
    event Claimed(address indexed account, uint256 amount, uint256 timestamp);
    event AmountUpdated(uint256 newAmount);
    event EventIdUpdated(bytes32 newEventId);
    
    constructor(
        address token_,
        uint256 amountPerClaim_,
        bytes32 eventId_
    ) Ownable(msg.sender) {
        token = IERC20(token_);
        amountPerClaim = amountPerClaim_;
        eventId = eventId_;
    }
    
    /**
     * @dev 用户领取代币（无需签名，依赖后端验证）
     * 前端在调用前必须先通过后端验证用户已签到
     */
    function claim() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(amountPerClaim > 0, "Amount not set");
        
        // 检查合约余额
        uint256 balance = token.balanceOf(address(this));
        require(balance >= amountPerClaim, "Insufficient contract balance");
        
        // 标记为已领取
        hasClaimed[msg.sender] = true;
        totalClaims++;
        
        // 转账代币
        require(token.transfer(msg.sender, amountPerClaim), "Transfer failed");
        
        emit Claimed(msg.sender, amountPerClaim, block.timestamp);
    }
    
    /**
     * @dev 批量设置已领取状态（管理员，用于同步链下数据）
     */
    function batchSetClaimed(address[] calldata accounts, bool claimed) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            hasClaimed[accounts[i]] = claimed;
        }
    }
    
    /**
     * @dev 更新每次领取金额（仅管理员）
     */
    function updateAmount(uint256 newAmount) external onlyOwner {
        amountPerClaim = newAmount;
        emit AmountUpdated(newAmount);
    }
    
    /**
     * @dev 更新活动 ID（仅管理员）
     */
    function updateEventId(bytes32 newEventId) external onlyOwner {
        eventId = newEventId;
        emit EventIdUpdated(newEventId);
    }
    
    /**
     * @dev 提取剩余代币（仅管理员）
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
    }
    
    /**
     * @dev 提取所有剩余代币（仅管理员）
     */
    function withdrawAllTokens(address to) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(to, balance), "Transfer failed");
    }
    
    /**
     * @dev 检查地址是否已领取
     */
    function isClaimed(address account) external view returns (bool) {
        return hasClaimed[account];
    }
    
    /**
     * @dev 获取合约代币余额
     */
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev 获取剩余可领取次数
     */
    function getRemainingClaims() external view returns (uint256) {
        uint256 balance = token.balanceOf(address(this));
        if (amountPerClaim == 0) return 0;
        return balance / amountPerClaim;
    }
}

