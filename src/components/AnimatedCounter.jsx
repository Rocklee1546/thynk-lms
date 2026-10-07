import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  formatter
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // IntersectionObserver to detect when element enters/leaves viewport during scroll up or down
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Reset when scrolled out of view so scrolling back triggers re-count
          setIsVisible(false);
          setCount(0);
        }
      },
      { threshold: 0.2 } // 20% visibility threshold
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  // Run smooth animation whenever element becomes visible in viewport
  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const rate = Math.min(progress / duration, 1);
      
      // Smooth ease-out exponential curve
      const easeOutRate = rate === 1 ? 1 : 1 - Math.pow(2, -10 * rate);
      const currentVal = easeOutRate * end;
      
      setCount(currentVal);

      if (rate < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, end, duration]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toLocaleString();

  if (formatter) {
    return <span ref={containerRef}>{formatter(count)}</span>;
  }

  return (
    <span ref={containerRef} className="inline-block transition-transform duration-300">
      {prefix}{displayValue}{suffix}
    </span>
  );
}
