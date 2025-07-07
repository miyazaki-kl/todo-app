export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // 最小文字数チェック
  if (password.length < 6) {
    errors.push('パスワードは6文字以上で入力してください');
  }

  // 最大文字数チェック（DoS攻撃対策）
  if (password.length > 128) {
    errors.push('パスワードは128文字以下で入力してください');
  }

  // 文字種チェック
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let complexityScore = 0;
  if (hasLowerCase) complexityScore++;
  if (hasUpperCase) complexityScore++;
  if (hasNumbers) complexityScore++;
  if (hasSpecialChars) complexityScore++;

  // 推奨事項（エラーではない）
  if (password.length >= 8) {
    if (complexityScore >= 3) {
      strength = 'strong';
    } else if (complexityScore >= 2) {
      strength = 'medium';
    }
  } else if (complexityScore >= 2) {
    strength = 'medium';
  }

  // 一般的な弱いパスワードパターンをチェック
  const weakPatterns = [
    /^(.)\1{5,}$/, // 同じ文字の繰り返し
    /^123456/, // 連続した数字
    /^password/i, // "password" で始まる
    /^qwerty/i, // "qwerty" で始まる
    /^abc123/i, // よくある組み合わせ
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('より安全なパスワードを設定してください');
      strength = 'weak';
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export function getPasswordStrengthMessage(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'パスワード強度: 弱い';
    case 'medium':
      return 'パスワード強度: 普通';
    case 'strong':
      return 'パスワード強度: 強い';
    default:
      return '';
  }
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}