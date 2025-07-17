// src/components/ResizableLayout.jsx
import React, { useRef, useState } from 'react';

const ResizableLayout = ({ left, right }) => {
  const [panelWidth, setPanelWidth] = useState(400);
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 200 && newWidth < 700) {
      setPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex-1">{left}</div>

      <div
        onMouseDown={handleMouseDown}
        className="w-1 cursor-col-resize bg-gray-700 hover:bg-gray-500 transition-colors"
      ></div>

      <div className="border-l border-gray-700" style={{ width: panelWidth }}>
        {right}
      </div>
    </div>
  );
};

export default ResizableLayout;
