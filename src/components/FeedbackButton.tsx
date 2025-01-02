import { useState } from 'react';
import wxQRCode from '../assets/wx.jpeg';

export const FeedbackButton = () => {
  const [showQRCode, setShowQRCode] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowQRCode(true)}
        className="fixed bottom-24 right-6 bg-white/40 hover:bg-white/60 backdrop-blur-sm 
                 text-gray-500/80 hover:text-gray-600 rounded-full p-2.5 
                  hover:shadow transition-all duration-200 ease-in-out"
        title="反馈"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </button>

      {showQRCode && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50"
          onClick={() => setShowQRCode(false)}
        >
          <div 
            className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg max-w-xs mx-4 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={wxQRCode} 
              alt="微信二维码" 
              className="w-full rounded-lg"
            />
            <p className="mt-4 text-center text-gray-500/90 text-sm">
              扫码反馈或交流
            </p>
          </div>
        </div>
      )}
    </>
  );
}; 