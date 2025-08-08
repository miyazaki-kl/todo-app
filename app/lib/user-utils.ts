export interface User {
  id: number;
  name: string;
  email: string;
}

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
    if (user && typeof user.id === 'number' && user.name && user.email) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('ユーザー情報の解析エラー:', error);
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') {
    return;
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