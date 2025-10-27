// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Poap1155WithSig
 * @notice POAP/出席徽章合约，支持由管理员离线签名授权，参会者自行上链领取
 *         流程：会场签到 -> 后端校验动态码 -> 后端用管理员私钥对领取消息签名 -> 前端调用 mintWithSig 铸章
 */
contract Poap1155WithSig is ERC1155, Ownable, EIP712 {
    using ECDSA for bytes32;

    // 每个活动一个 tokenId（eventId）
    mapping(uint256 => string) public tokenURIMap; 

    // 防重复领取：eventId -> wallet -> claimed
    mapping(uint256 => mapping(address => bool)) public claimed;

    // per-wallet nonce，避免重放（链上自增，后端需读取或由前端读取后传回）
    mapping(address => uint256) public nonces;

    // EIP-712 typehash
    // keccak256("Mint(address to,uint256 eventId,uint256 amount,uint256 nonce,uint256 deadline)");
    bytes32 public constant MINT_TYPEHASH = 0x2fcd5d1995a0d2d059a93d9dbb0b84e474b52e5acd4daff4abf641a6cc3b2e2c;

    event Issued(uint256 indexed eventId, address indexed to, uint256 amount);
    event URISet(uint256 indexed eventId, string newuri);

    constructor() ERC1155("") EIP712("Poap1155WithSig", "1") Ownable(msg.sender) {}

    function setURI(uint256 eventId, string calldata newuri) external onlyOwner {
        tokenURIMap[eventId] = newuri;
        emit URISet(eventId, newuri);
        emit URI(newuri, eventId);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return tokenURIMap[id];
    }

    /**
     * @notice 由管理员离线签名，参会者携带签名铸造
     */
    function mintWithSig(
        address to,
        uint256 eventId,
        uint256 amount,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        require(block.timestamp <= deadline, "signature expired");
        require(!claimed[eventId][to], "already claimed");
        uint256 nonce = nonces[to];

        bytes32 structHash = keccak256(abi.encode(
            MINT_TYPEHASH,
            to,
            eventId,
            amount,
            nonce,
            deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == owner(), "invalid signer");

        // 标记领取
        claimed[eventId][to] = true;
        // 自增 nonce，避免重放
        nonces[to] = nonce + 1;

        _mint(to, eventId, amount, "");
        emit Issued(eventId, to, amount);
    }
}
