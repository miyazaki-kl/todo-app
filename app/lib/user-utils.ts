export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * 現在のユーザー情報を取得する
 * 
 * ⚠️ セキュリティ警告:
 * この実装はlocalStorageを使用しており、以下のセキュリティリスクがあります:
 * - XSS攻撃による認証情報漏洩
 * - クライアントサイドでの認証情報改ざん
 * - 平文での認証情報保存
 * 
 * 本番環境では以下の対応を推奨:
 * - JWTトークンまたはセッション管理への移行
 * - HTTPOnlyクッキーでの認証情報管理
 * - サーバーサイドでの認証状態検証
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr);
    
    // 基本的なバリデーション
    if (!user || typeof user.id !== 'number' || !user.name || !user.email) {
      console.warn('無効なユーザー情報が検出されました。認証情報をクリアします。');
      clearCurrentUser();
      return null;
    }
    
    // メールアドレスの基本的な形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      console.warn('無効なメールアドレス形式が検出されました。');
      clearCurrentUser();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('ユーザー情報の解析エラー:', error);
    // 破損したデータをクリア
    clearCurrentUser();
    return null;
  }
};

/**
 * ユーザー情報を設定する
 * 
 * ⚠️ セキュリティ警告: 
 * localStorageでの平文保存は本番環境では非推奨
 */
export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // 基本的なバリデーション
  if (!user || typeof user.id !== 'number' || !user.name || !user.email) {
    throw new Error('無効なユーザー情報です');
  }
  
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('user');
};

export const getCurrentUserId = (): number | null => {
  const user = getCurrentUser();
  return user?.id || null;
};