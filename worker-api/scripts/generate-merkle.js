// Merkle Tree 生成工具
// 从数据库获取签到用户并生成 Merkle Tree

const crypto = require('crypto');

/**
 * 生成 Merkle Tree 和每个用户的 proof
 */
function generateMerkleTree(addresses, amounts) {
  if (!addresses || addresses.length === 0) {
    throw new Error('No addresses provided');
  }
  
  // 创建叶子节点: sha256(index, address, amount)
  const leaves = addresses.map((addr, i) => {
    const indexBuf = Buffer.alloc(1);
    indexBuf.writeUInt8(i, 0);
    
    const addressBuf = Buffer.from(addr.slice(2), 'hex');
    const amountBuf = Buffer.from(amounts[i].slice(2), 'hex');
    
    const leaf = crypto.createHash('sha256')
      .update(Buffer.concat([indexBuf, addressBuf, amountBuf]))
      .digest();
    
    return { leaf, index: i, address: addr, amount: amounts[i] };
  });
  
  // 构建 Merkle Tree
  let nodes = leaves.map(l => ({ hash: l.leaf, data: l }));
  
  while (nodes.length > 1) {
    const pairs = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        const left = nodes[i];
        const right = nodes[i + 1];
        
        const sorted = left.hash <= right.hash 
          ? [left.hash, right.hash]
          : [right.hash, left.hash];
        
        const parent = crypto.createHash('sha256')
          .update(Buffer.concat(sorted))
          .digest();
        
        pairs.push({ 
          hash: parent, 
          children: [left, right],
          data: { isLeaf: false }
        });
      } else {
        pairs.push(nodes[i]);
      }
    }
    nodes = pairs;
  }
  
  const root = nodes[0].hash;
  
  // 为每个叶子节点生成 proof
  const proofs = leaves.map((leaf, i) => {
    const proof = [];
    let current = leaves[i];
    const leafNodes = [...leaves];
    
    let currentLevel = leafNodes;
    
    while (currentLevel.length > 1) {
      const nextLevel = [];
      const siblingMap = new Map();
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          const left = currentLevel[i];
          const right = currentLevel[i + 1];
          
          const sorted = left.leaf <= right.leaf 
            ? [left.leaf, right.leaf]
            : [right.leaf, left.leaf];
          
          const parent = crypto.createHash('sha256')
            .update(Buffer.concat(sorted))
            .digest();
          
          nextLevel.push({ leaf: parent, children: [left, right] });
          siblingMap.set(left.leaf.toString('hex'), right.leaf);
          siblingMap.set(right.leaf.toString('hex'), left.leaf);
        } else {
          nextLevel.push(currentLevel[i]);
        }
      }
      
      // 找到当前节点的兄弟节点
      if (current) {
        const sibling = siblingMap.get(current.leaf.toString('hex'));
        if (sibling) {
          proof.push('0x' + sibling.toString('hex'));
        }
      }
      
      // 找到当前节点在下一层的父节点
      const parentNode = nextLevel.find(n => 
        n.children && n.children.some(c => c.leaf.equals(current.leaf))
      );
      if (parentNode) {
        current = parentNode.children.find(c => !c.leaf.equals(current.leaf));
      }
      
      currentLevel = nextLevel;
    }
    
    return proof.reverse();
  });
  
  return {
    root: '0x' + root.toString('hex'),
    proofs: proofs.map(p => p),
    leaves: leaves.map(l => ({
      index: l.index,
      address: l.address,
      amount: l.amount,
      proof: leaves[l.index] ? proofs[l.index] : []
    }))
  };
}

/**
 * 主函数：从数据库读取并生成 Merkle Tree
 */
async function generateMerkleFromDatabase(env, eventId) {
  const { query, run } = require('./db.js');
  
  // 从数据库获取所有签到用户
  const checkins = await query(env, `
    SELECT DISTINCT wallet
    FROM checkins
    WHERE event_id = ?
    ORDER BY created_at
  `, [eventId]);
  
  if (!checkins || checkins.length === 0) {
    throw new Error('No checkins found for event ' + eventId);
  }
  
  const addresses = checkins.map(c => c.wallet);
  const amount = "1000000000000000000"; // 1 token (18 decimals)
  const amounts = addresses.map(() => amount);
  
  // 生成 Merkle Tree
  const { root, leaves } = generateMerkleTree(addresses, amounts);
  
  // 更新数据库中的证明
  for (const leaf of leaves) {
    await run(env, `
      UPDATE airdrop_eligible
      SET item_index = ?,
          proof = ?,
          merkle_batch = ?
      WHERE wallet = ? AND event_id = ?
    `, [
      leaf.index,
      JSON.stringify(leaf.proof),
      eventId,
      leaf.address.toLowerCase(),
      eventId
    ]);
  }
  
  // 创建 Merkle 批次记录
  const distributorAddress = env.DISTRIBUTOR_ADDRESS || '0x0000000000000000000000000000000000000000';
  
  await run(env, `
    INSERT INTO merkle_batches (batch_id, merkle_root, distributor_address, total_amount, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))
    ON CONFLICT(batch_id) DO UPDATE SET
      merkle_root = excluded.merkle_root,
      total_amount = excluded.total_amount
  `, [
    eventId,
    root,
    distributorAddress,
    (BigInt(amount) * BigInt(addresses.length)).toString()
  ]);
  
  return {
    eventId,
    root,
    totalAddresses: addresses.length,
    totalAmount: (BigInt(amount) * BigInt(addresses.length)).toString()
  };
}

module.exports = {
  generateMerkleTree,
  generateMerkleFromDatabase
};

