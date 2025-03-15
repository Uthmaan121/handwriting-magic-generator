
import React from 'react';

export const AppIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 12L11 10L13 12L15 10L17 12M7 8L9 6L11 8L13 6L15 8L17 6L19 8M19 12L17 14L15 12L13 14L11 12L9 14L7 12M7 16L9 14L11 16L13 14L15 16L17 14L19 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
