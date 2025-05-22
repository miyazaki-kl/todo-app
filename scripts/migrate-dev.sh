#!/bin/sh
set -e

# データベースの準備ができるまで待機
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# 開発用マイグレーションの実行
echo "Running development migrations..."
npx prisma migrate dev --name init

# Prisma Studioの起動（オプション）
if [ "$1" = "--studio" ]; then
  echo "Starting Prisma Studio..."
  npx prisma studio
fi 