interface LoginScreenProps {
  isLoading: boolean;
  error: string | null;
  onLogin: () => void;
}

export const LoginScreen = ({ isLoading, error, onLogin }: LoginScreenProps) => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-pink-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3H9z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-pink-400 absolute -right-4 -top-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3H9z"/>
            </svg>
          </div>
          <span className="mt-3 text-2xl font-bold tracking-wide bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
            BiliMusic
          </span>
        </div>
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
