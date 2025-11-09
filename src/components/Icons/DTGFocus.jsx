import React from 'react';

const DTGFocus = ({ size = 24, color, className = '', ...props }) => {
  
  // The viewBox is perfect: 70x69 units, which scales easily.
  const ICON_VIEWBOX = "0 0 70 69"; 

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve" // xml:space -> xmlSpace
      overflow="hidden" 
      viewBox={ICON_VIEWBOX} // Use the normalized 70x69 viewBox
      
      width={size}
      height={size}
      className={className}
      style={{ color: color }} // Applies color via the 'color' prop
      fill="none" // Default to none, as most paths use stroke
      {...props}
    >
      {/* All attributes converted to camelCase (stroke-width -> strokeWidth) */}
      {/* All colors replaced with "currentColor" */}
      
      {/* Path 1 */}
      <path 
        stroke="currentColor" 
        strokeMiterlimit="8" 
        strokeWidth="3.485" 
        d="m54.515 64.45 7.613 4.353" 
        transform="matrix(1 0 0 1.00669 -32.592 -23.36)"
      />
      
      {/* Path 2 */}
      <path 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeMiterlimit="10" 
        strokeWidth="2.556" 
        d="m44.175 76.894-10.316-5.158V57.062l10.316-5.158 10.315 5.158v14.674Z" 
        transform="matrix(1 0 0 1.00669 -32.592 -23.36)"
      />
      
      {/* Path 3 */}
      <path 
        stroke="currentColor" 
        strokeMiterlimit="8" 
        strokeWidth="3.485" 
        d="M67.846 57.657v7.17" 
        transform="matrix(1 0 0 1.00669 -32.592 -23.36)"
      />
      
      {/* Path 4 (Transformed) */}
      <path 
        stroke="currentColor" 
        strokeMiterlimit="8" 
        strokeWidth="3.485" 
        d="m0 0 7.083 2.614" 
        transform="matrix(-1 0 0 1.00669 48.114 42.848)"
      />
      
      {/* Path 5 (Filled) */}
      <path 
        fill="currentColor" 
        fillRule="evenodd" // fill-rule -> fillRule
        d="m35 59.661-8.186-4.12V43.88L35 39.761l8.186 4.12v11.66Z"
      />
      
      {/* Path 6 */}
      <path 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeMiterlimit="10" 
        strokeWidth="2.556" 
        d="M67.592 58.849 57.277 53.69V39.068l10.315-5.158 10.315 5.158V53.69ZM91.01 76.894l-10.315-5.158V57.062l10.315-5.158 10.315 5.158v14.674Z" 
        transform="matrix(1 0 0 1.00669 -32.592 -23.36)"
      />
    </svg>
  );
};

export default DTGFocus;