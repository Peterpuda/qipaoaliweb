// 独立的 Merkle Tree 生成脚本（不依赖数据库）
const crypto = require('crypto');

/**
 * 生成 Merkle Tree
 * @param {Array<{address: string, amount: string}>} recipients - 接收者列表
 * @returns {Object} - { root, leaves }
 */
function generateMerkleTree(recipients) {
  console.log(`\n📊 开始生成 Merkle Tree (${recipients.length} 个地址)...`);
  
  // 创建叶子节点
  const leaves = recipients.map((recipient, index) => {
    // 计算叶子节点: keccak256(abi.encode(index, address, amount))
    const abiEncoded = Buffer.concat([
      Buffer.from(index.toString(16).padStart(64, '0'), 'hex'), // uint256 index
      Buffer.from(recipient.address.slice(2).padStart(64, '0'), 'hex'), // address
      Buffer.from(recipient.amount.slice(2).padStart(64, '0'), 'hex') // uint256 amount
    ]);
    
    const leaf = '0x' + crypto.createHash('sha256')
      .update(abiEncoded)
      .digest('hex');
    
    return {
      index,
      address: recipient.address.toLowerCase(),
      amount: recipient.amount,
      leaf
    };
  });
  
  // 构建 Merkle Tree
  let currentLevel = leaves.map(l => l.leaf);
  const tree = [currentLevel];
  
  while (currentLevel.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        
        // 按字典序排序后计算父节点
        const sorted = left < right ? [left, right] : [right, left];
        const parent = '0x' + crypto.createHash('sha256')
          .update(Buffer.from(sorted[0].slice(2) + sorted[1].slice(2), 'hex'))
          .digest('hex');
        
        nextLevel.push(parent);
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    
    tree.push(nextLevel);
    currentLevel = nextLevel;
  }
  
  const root = tree[tree.length - 1][0];
  
  // 为每个叶子生成证明
  leaves.forEach((leaf, leafIndex) => {
    const proof = [];
    let index = leafIndex;
    
    for (let level = 0; level < tree.length - 1; level++) {
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;
      
      if (siblingIndex < tree[level].length) {
        proof.push(tree[level][siblingIndex]);
      }
      
      index = Math.floor(index / 2);
    }
    
    leaf.proof = proof;
  });
  
  console.log(`✅ Merkle Tree 生成完成`);
  console.log(`   Root: ${root}`);
  console.log(`   Leaves: ${leaves.length}`);
  
  return { root, leaves };
}

// 测试/示例用法
if (require.main === module) {
  // 示例：3个地址，每人1000代币
  const recipients = [
    {
      address: '0x1111111111111111111111111111111111111111',
      amount: '0x' + (1000n * 10n**18n).toString(16) // 1000 tokens
    },
    {
      address: '0x2222222222222222222222222222222222222222',
      amount: '0x' + (1000n * 10n**18n).toString(16)
    },
    {
      address: '0x3333333333333333333333333333333333333333',
      amount: '0x' + (1000n * 10n**18n).toString(16)
    }
  ];
  
  const { root, leaves } = generateMerkleTree(recipients);
  
  console.log('\n📋 完整信息:');
  console.log('Merkle Root:', root);
  console.log('\n接收者信息:');
  leaves.forEach(leaf => {
    console.log(`\n  地址: ${leaf.address}`);
    console.log(`  索引: ${leaf.index}`);
    console.log(`  数量: ${BigInt(leaf.amount).toString()} wei (${BigInt(leaf.amount) / 10n**18n} tokens)`);
    console.log(`  证明: [${leaf.proof.join(', ')}]`);
  });
}

module.exports = { generateMerkleTree };

