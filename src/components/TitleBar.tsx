const TitleBar = () => {
  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
  };

  return (
    <div className="flex items-center gap-2 -app-region-drag">
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all duration-200 flex items-center justify-center group -app-region-no-drag"
      >
        <svg
          className="w-[8px] h-[8px] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          viewBox="0 0 12 12"
        >
          <path
            d="M2.5 2.5l7 7m-7 0l7-7"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all duration-200 flex items-center justify-center group -app-region-no-drag"
      >
        <svg
          className="w-[8px] h-[8px] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          viewBox="0 0 12 12"
        >
          <path
            d="M2.5 6h7"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full bg-[#28C940] hover:brightness-90 transition-all duration-200 flex items-center justify-center group -app-region-no-drag"
      >
        <svg
          className="w-[8px] h-[8px] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          viewBox="0 0 12 12"
        >
          <path
            d="M3.5 3.5h5v5h-5z"
            stroke="currentColor"
            strokeWidth="1.1"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
};

export default TitleBar;
