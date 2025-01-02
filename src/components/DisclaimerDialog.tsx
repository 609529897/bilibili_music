import { useState } from 'react';

interface DisclaimerDialogProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const DisclaimerDialog = ({ isOpen, onAccept }: DisclaimerDialogProps) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[480px] max-h-[85vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900">免责声明</h2>
        </div>
        
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="space-y-4 text-gray-600">
            <p>欢迎使用 BiliMusic。在使用本应用之前，请仔细阅读以下声明：</p>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">使用条件</h3>
              <p>• 本应用仅供个人学习和研究使用，不得用于任何商业用途</p>
              <p>• 使用本应用需要您拥有合法的哔哩哔哩账号</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">版权声明</h3>
              <p>• 本应用展示的所有音视频内容版权均归属于原作者和哔哩哔哩</p>
              <p>• 本应用仅提供内容展示，不提供任何下载或存储功能</p>
              <p>• 如果版权方认为本应用侵犯了其合法权益，我们将立即下架相关功能</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">功能限制</h3>
              <p>• 仅支持播放用户自己的收藏内容</p>
              <p>• 不提供任何下载功能</p>
              <p>• 不会在本地永久保存任何音视频内容</p>
              <p>• 将保留所有原创作者信息和哔哩哔哩来源标识</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <label className="flex items-center space-x-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-gray-600">
              我已阅读并同意上述声明
            </span>
          </label>

          <button
            onClick={onAccept}
            disabled={!isChecked}
            className="w-full px-4 py-2 text-white bg-pink-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
          >
            同意并继续
          </button>
        </div>
      </div>
    </div>
  );
}; 