#!/bin/bash

# 导出Cloudflare D1数据脚本
# 用途: 将D1数据库中的所有表导出为JSON格式

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始导出Cloudflare D1数据"
echo "=========================================="

# 配置
DB_NAME="poap-db"
DATA_DIR="../data"
LOG_DIR="../logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/export_${TIMESTAMP}.log"

# 创建目录
mkdir -p "$DATA_DIR"
mkdir -p "$LOG_DIR"

# 切换到worker-api目录
cd ../../worker-api

echo "数据库名称: $DB_NAME"
echo "输出目录: $DATA_DIR"
echo "日志文件: $LOG_FILE"
echo ""

# 定义要导出的表
TABLES=(
  "events"
  "checkins"
  "members"
  "products"
  "artisans"
  "orders"
  "rewards"
  "content_variants"
  "badges_issues"
  "shipping_info"
  "admin_sessions"
)

# 导出函数
export_table() {
  local table=$1
  local output_file="../migration/$DATA_DIR/${table}.json"
  
  echo "正在导出表: $table ..."
  
  npx wrangler d1 execute "$DB_NAME" --remote \
    --command="SELECT * FROM $table" \
    --json > "$output_file" 2>> "../migration/$LOG_FILE"
  
  if [ $? -eq 0 ]; then
    local count=$(cat "$output_file" | jq '. | length')
    echo "✅ $table: $count 条记录"
  else
    echo "❌ $table: 导出失败"
    return 1
  fi
}

# 导出所有表
echo "开始导出数据..."
echo ""

for table in "${TABLES[@]}"; do
  export_table "$table"
  sleep 1  # 避免请求过快
done

echo ""
echo "=========================================="
echo "数据导出完成！"
echo "=========================================="
echo "输出目录: ../migration/$DATA_DIR"
echo "日志文件: ../migration/$LOG_FILE"
echo ""

# 统计总记录数
echo "统计信息:"
for table in "${TABLES[@]}"; do
  file="../migration/$DATA_DIR/${table}.json"
  if [ -f "$file" ]; then
    count=$(cat "$file" | jq '. | length')
    printf "  %-20s %6d 条\n" "$table:" "$count"
  fi
done

echo ""
echo "下一步: 运行 node scripts/2-import-to-rds.js 导入数据到RDS"

