FROM node:20-slim

WORKDIR /app

# OpenSSLのインストール
RUN apt-get update -y && \
    apt-get install -y openssl netcat-traditional && \
    rm -rf /var/lib/apt/lists/*

# パッケージのインストール
COPY package*.json ./
RUN npm install

# Prismaの設定
COPY prisma ./prisma/

# 環境変数を設定
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/todo_app"

# ディレクトリの作成とパーミッション設定
RUN chown -R node:node node_modules && \
    chmod -R 755 node_modules

# Prismaのクライアントを生成
USER node
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"] 