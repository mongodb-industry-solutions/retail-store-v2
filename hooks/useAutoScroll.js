import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for implementing terminal-like auto-scroll behavior
 * Only auto-scrolls to bottom when user is already at the bottom
 * 
 * @param {Array} items - Array of items to monitor for changes
 * @param {number} tolerance - Scroll tolerance in pixels (default: 5)
 * @returns {Object} - { containerRef, isAtBottom }
 */
const useAutoScroll = (items, tolerance = 5) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef(null);

  // Check if user is at the bottom of the scroll
  const checkIfAtBottom = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < tolerance;
      setIsAtBottom(atBottom);
    }
  };

  // Auto-scroll to bottom when items change, but only if user was already at bottom
  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [items, isAtBottom]);

  // Add scroll listener to track user's scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom);
      // Check initial position
      checkIfAtBottom();
      
      return () => {
        container.removeEventListener('scroll', checkIfAtBottom);
      };
    }
  }, [tolerance]);

  return { containerRef, isAtBottom };
};

export default useAutoScroll;