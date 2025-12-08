import React from 'react';
import { useCursorPosition } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedBackground = () => {
  const cursorPos = useCursorPosition();
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundImage: `radial-gradient(circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(20,184,166,${isDark ? '0.08' : '0.12'}) 0%, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 opacity-30 bg-grid" />
      <div className={`absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-primary-500/10' : 'bg-primary-500/20'}`} />
      <div className={`absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/15'}`} />
    </div>
  );
};

export default AnimatedBackground;
