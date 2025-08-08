'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword, getPasswordStrengthMessage, getPasswordStrengthColor } from '@/app/lib/password-validation';
import { apiClient } from '@/app/lib/api-client';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
  const router = useRouter();

  useEffect(() => {
    // 認証状態チェック
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');
    
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    
    // ユーザー情報の取得
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('ユーザー情報の解析エラー:', error);
      }
    }
  }, [router]);

  // パスワード強度をリアルタイムで更新
  useEffect(() => {
    if (newPassword) {
      setPasswordValidation(validatePassword(newPassword));
    } else {
      setPasswordValidation(validatePassword(''));
    }
  }, [newPassword]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setMessage('ユーザー情報が取得できませんでした');
      setMessageType('error');
      return;
    }

    // フォームバリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('すべての項目を入力してください');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('新しいパスワードと確認パスワードが一致しません');
      setMessageType('error');
      return;
    }

    if (!passwordValidation.isValid) {
      setMessage(passwordValidation.errors[0] || 'パスワードの形式が正しくありません');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const data = await apiClient.put<{success: boolean, message?: string}>('/api/users/password', {
        userId: currentUser.id,
        currentPassword,
        newPassword,
      });

      if (data.success) {
        setMessage('パスワードが正常に変更されました');
        setMessageType('success');
        // フォームをリセット
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.message || 'パスワードの変更に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      setMessage(error instanceof Error ? error.message : 'サーバーエラーが発生しました');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    apiClient.clearAuthToken();
    router.push('/login');
  };

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインページにリダイレクトしています...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Todo一覧に戻る
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">ログイン中: </span>
                  <span className="text-gray-900">
                    {currentUser.name || currentUser.email}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール設定</h1>
          <p className="mt-2 text-gray-600">アカウント情報とパスワードの変更</p>
        </div>

        {/* ユーザー情報 */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">ユーザー情報</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">名前</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={currentUser?.name || ''}
                    disabled
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">パスワード変更</h2>
          </div>
          <div className="px-6 py-4">
            {message && (
              <div className={`mb-6 px-4 py-3 rounded ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  現在のパスワード
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="現在のパスワード"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新しいパスワード
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="新しいパスワード（6文字以上）"
                  />
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className={`text-sm ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                      {getPasswordStrengthMessage(passwordValidation.strength)}
                    </div>
                    {passwordValidation.errors.length > 0 && (
                      <div className="mt-1 text-sm text-red-600">
                        <ul className="list-disc list-inside">
                          {passwordValidation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  新しいパスワード（確認）
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="新しいパスワード（確認）"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="showPasswords"
                  name="showPasswords"
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showPasswords" className="ml-2 block text-sm text-gray-900">
                  パスワードを表示
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '変更中...' : 'パスワードを変更'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}