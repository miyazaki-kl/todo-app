import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../app/lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('シードデータの作成を開始...');

  // adminユーザーが既に存在するかチェック
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    // adminユーザーを作成
    const hashedAdminPassword = await hashPassword('admin');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: '管理者',
        password: hashedAdminPassword,
        isAdmin: true,  // admin権限を付与
      },
    });

    console.log('adminユーザーを作成しました:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      isAdmin: adminUser.isAdmin,
    });
  } else {
    console.log('adminユーザーは既に存在します');
  }

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
        isAdmin: false,  // 通常ユーザー
      },
    });

    console.log('テストユーザーを作成しました:', {
      id: newTestUser.id,
      email: newTestUser.email,
      name: newTestUser.name,
      isAdmin: newTestUser.isAdmin,
    });
  } else {
    console.log('テストユーザーは既に存在します');
  }

  // サンプルユーザー作成（日本人風の名前）
  const sampleUsers = [
    { email: 'yamada@example.com', name: '山田太郎', password: 'yamada' },
    { email: 'sato@example.com', name: '佐藤花子', password: 'sato' },
    { email: 'tanaka@example.com', name: '田中次郎', password: 'tanaka' },
    { email: 'suzuki@example.com', name: '鈴木雪', password: 'suzuki' },
    { email: 'watanabe@example.com', name: '渡辺寛', password: 'watanabe' },
  ];

  console.log('サンプルユーザーの作成を開始...');
  
  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await hashPassword(userData.password);
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          isAdmin: false,
        },
      });

      console.log(`ユーザー「${newUser.name}」を作成しました`);
    } else {
      console.log(`ユーザー「${userData.name}」は既に存在します`);
    }
  }

  // 初期ラベルデータの作成
  const labelsData = [
    { name: '緊急', color: 'red' },
    { name: '重要', color: 'orange' },
    { name: '進行中', color: 'blue' },
    { name: 'レビュー', color: 'purple' },
    { name: '完了予定', color: 'green' },
    { name: '参考', color: 'gray' },
  ];

  console.log('初期ラベルの作成を開始...');
  
  for (const labelData of labelsData) {
    const existingLabel = await prisma.label.findUnique({
      where: { name: labelData.name },
    });

    if (!existingLabel) {
      const label = await prisma.label.create({
        data: labelData,
      });
      console.log(`ラベル「${label.name}」を作成しました`);
    } else {
      console.log(`ラベル「${labelData.name}」は既に存在します`);
    }
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