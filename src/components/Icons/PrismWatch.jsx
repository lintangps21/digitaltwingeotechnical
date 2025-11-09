import React from 'react';

const PrismWatch = ({ size = 24, color, className = '', ...props }) => {
  
  // 🚨 FIX: Set the viewBox to the original drawing area (250, 27) 
  // and keep the original size (70x69). This makes the path coordinates visible.
  const ICON_VIEWBOX = "250 27 70 69"; 

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve" 
      overflow="hidden" 
      viewBox={ICON_VIEWBOX} // ⬅️ NEW ViewBox is 250 27 70 69
      
      width={size}
      height={size}
      className={className}
      style={{ color: color }} 
      fill="none" 
      {...props}
    >
      {/* 🚨 FIX: Remove the outer <g> group entirely, as its transform is now 
         handled by the viewBox, and move its contents one level up.
         (The inner <path> elements' coordinates are now visible in the window) 
      */}
      <g fill="currentColor" fillRule="evenodd">
        <path d="m263.188 81.404 27.094-53.945L250 83.593l13.188-2.189ZM305.775 78.155c4.253 6.18 7.92 11.174 12.173 17.354-4.67-5.562-8.75-9.939-13.42-15.5l1.247-1.854Z"/>
        <path d="m302.229 83.203-49.903 1.485 53.509-6.553-3.606 5.068ZM291.465 27.866l-3.089 11.84 11.122 13.68-8.033-25.52ZM270.827 79.3l19.38-51.534L263.3 81.449l7.526-2.148Z"/>
        <path d="m291.163 27.023-2.55 11.952 10.853 13.769-8.303-25.721ZM252.28 84.666l1.882-.21 51.042-5.457 13.808 17-66.732-11.333ZM304.875 65.597l1.594 12.24L319.998 96l-15.124-30.403Z"/>
      </g>
    </svg>
  );
};

export default PrismWatch;