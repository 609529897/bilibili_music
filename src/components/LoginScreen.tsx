interface LoginScreenProps {
  isLoading: boolean;
  error: string | null;
  onLogin: () => void;
}

export const LoginScreen = ({ isLoading, error, onLogin }: LoginScreenProps) => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-pink-500 mx-auto mb-6" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
        </svg>
        <p className="text-gray-500 mb-8">请先登录以继续使用</p>
        <button
          onClick={onLogin}
          disabled={isLoading}
          className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '登录中...' : '登录 B 站账号'}
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};
