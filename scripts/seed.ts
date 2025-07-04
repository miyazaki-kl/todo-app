import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../app/lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('シードデータの作成を開始...');

  // adminユーザーが既に存在するかチェック
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (existingAdmin) {
    console.log('adminユーザーは既に存在します');
    return;
  }

  // adminユーザーを作成
  const hashedAdminPassword = await hashPassword('admin');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理者',
      password: hashedAdminPassword,
    },
  });

  console.log('adminユーザーを作成しました:', {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
  });

  // 追加のテストユーザー作成
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  if (!testUser) {
    const hashedTestPassword = await hashPassword('test123');
    const newTestUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'テストユーザー',
        password: hashedTestPassword,
      },
    });

    console.log('テストユーザーを作成しました:', {
      id: newTestUser.id,
      email: newTestUser.email,
      name: newTestUser.name,
    });
  } else {
    console.log('テストユーザーは既に存在します');
  }

  console.log('シードデータの作成が完了しました');
}

main()
  .catch((e) => {
    console.error('シードデータ作成エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });