import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 初期プロジェクトデータを作成
  const projects = [
    {
      name: 'サンプルプロジェクト',
      description: 'プロジェクト機能のテスト用サンプル',
      color: 'blue',
    },
    {
      name: 'ウェブサイト開発',
      description: 'コーポレートサイトの制作プロジェクト',
      color: 'green',
    },
    {
      name: 'マーケティング',
      description: 'マーケティング関連のタスク管理',
      color: 'purple',
    },
    {
      name: 'デザイン',
      description: 'デザイン作業とレビュー',
      color: 'pink',
    },
    {
      name: 'バックエンド開発',
      description: 'サーバーサイドの開発とAPI設計',
      color: 'indigo',
    },
    {
      name: 'フロントエンド開発',
      description: 'UI/UXとフロントエンドの実装',
      color: 'orange',
    },
  ];

  console.log('初期プロジェクトデータを投入中...');
  
  for (const project of projects) {
    const created = await prisma.project.create({
      data: project,
    });
    console.log(`プロジェクト作成: ${created.name}`);
  }

  console.log('初期プロジェクトデータの投入が完了しました');
}

main()
  .catch((e) => {
    console.error('エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });