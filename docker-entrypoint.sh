#!/bin/sh
set -e

# データベースの準備ができるまで待機
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Prismaのマイグレーションを実行
echo "Running Prisma migrations..."
npx prisma migrate deploy

# コマンドを実行
exec "$@" 