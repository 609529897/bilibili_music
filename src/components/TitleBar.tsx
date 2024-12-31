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
          className="w-[6px] h-[6px] text-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          viewBox="0 0 24 24"
        >
          <path
            d="M6.343 6.343l11.314 11.314 m-11.314 0l11.314-11.314"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all duration-200 flex items-center justify-center group -app-region-no-drag"
      >
        <svg
          className="w-[6px] h-[6px] text-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full bg-[#28C940] hover:brightness-90 transition-all duration-200 flex items-center justify-center group -app-region-no-drag"
      >
        <svg
          className="w-[6px] h-[6px] text-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 6h9v9 M6 9v9h9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
};

export default TitleBar;
