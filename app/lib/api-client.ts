class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = '';
  }

  /**
   * 認証トークンを取得
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * デフォルトヘッダーを取得
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // デバッグ用ログ（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        console.log('APIクライアント: 認証ヘッダーを設定', {
          hasToken: true,
          tokenStart: token.substring(0, 20) + '...'
        });
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('APIクライアント: 認証トークンが見つかりません');
      }
    }

    return headers;
  }

  /**
   * APIレスポンスのエラーハンドリング
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // 401エラーの場合、ログイン画面にリダイレクト
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      const error = await response.json().catch(() => ({ message: 'エラーが発生しました' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * GETリクエスト
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POSTリクエスト
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUTリクエスト
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 認証トークンを設定
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * 認証トークンをクリア
   */
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
}

export const apiClient = new ApiClient();