// worker-api/utils/db-mysql.js
// MySQL数据库适配层 - 用于替代Cloudflare D1

import mysql from 'mysql2/promise';

let pool;

/**
 * 初始化MySQL连接池
 * @param {Object} env - 环境变量对象
 * @returns {Pool} MySQL连接池
 */
export function initPool(env) {
  if (pool) {
    console.log('♻️ 复用现有MySQL连接池');
    return pool;
  }
  
  const config = {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '3306'),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // 字符集设置
    charset: 'utf8mb4',
    // 时区设置
    timezone: '+08:00',
    // 连接超时
    connectTimeout: 10000,
    // 支持多语句查询（谨慎使用）
    multipleStatements: false
  };
  
  pool = mysql.createPool(config);
  
  console.log(`✅ MySQL连接池已创建: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
  
  // 测试连接
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL连接测试成功');
      conn.release();
    })
    .catch(err => {
      console.error('❌ MySQL连接测试失败:', err.message);
    });
  
  return pool;
}

/**
 * 执行查询（SELECT等返回结果集的操作）
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('❌ 数据库连接池未初始化，请先调用 initPool()');
  }
  
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ 数据库查询失败:', {
      sql: sql.substring(0, 100),
      error: error.message
    });
    throw error;
  }
}

/**
 * 执行操作（INSERT, UPDATE, DELETE等）
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Object>} 执行结果（包含affectedRows, insertId等）
 */
export async function run(sql, params = []) {
  if (!pool) {
    throw new Error('❌ 数据库连接池未初始化，请先调用 initPool()');
  }
  
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('❌ 数据库操作失败:', {
      sql: sql.substring(0, 100),
      error: error.message
    });
    throw error;
  }
}

/**
 * 执行事务
 * @param {Function} callback - 事务回调函数，接收connection参数
 * @returns {Promise<any>} 事务执行结果
 */
export async function transaction(callback) {
  if (!pool) {
    throw new Error('❌ 数据库连接池未初始化，请先调用 initPool()');
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('❌ 事务执行失败:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 批量插入
 * @param {string} table - 表名
 * @param {Array<Object>} data - 数据数组
 * @returns {Promise<Object>} 插入结果
 */
export async function batchInsert(table, data) {
  if (!data || data.length === 0) {
    return { affectedRows: 0 };
  }
  
  const keys = Object.keys(data[0]);
  const placeholders = keys.map(() => '?').join(',');
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let totalAffected = 0;
    for (const row of data) {
      const values = keys.map(k => row[k]);
      const [result] = await connection.execute(sql, values);
      totalAffected += result.affectedRows;
    }
    
    await connection.commit();
    return { affectedRows: totalAffected };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 确保数据库Schema已创建（兼容D1接口）
 * MySQL中表结构在部署时已创建，此函数仅做日志记录
 */
export async function ensureSchema() {
  console.log('✅ MySQL Schema 检查完成（表结构应在部署时已创建）');
}

/**
 * 关闭连接池（优雅退出时调用）
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ MySQL连接池已关闭');
  }
}

/**
 * 获取连接池状态
 * @returns {Object} 连接池状态信息
 */
export function getPoolStatus() {
  if (!pool) {
    return { initialized: false };
  }
  
  return {
    initialized: true,
    // MySQL2连接池没有直接暴露这些属性，需要通过其他方式获取
    // 这里提供基本信息
    info: 'MySQL连接池运行中'
  };
}

// 导出默认对象（兼容不同的导入方式）
export default {
  initPool,
  query,
  run,
  transaction,
  batchInsert,
  ensureSchema,
  closePool,
  getPoolStatus
};

