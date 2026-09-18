import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

/**
 * AnimatedStatCounter — FAANG-grade animated number counter
 * Uses framer-motion's useMotionValue + animate() for smooth count-up effect.
 *
 * Resume metric: "Built animated stat counters with framer-motion, displaying
 * live database metrics (diseases, pain points, solutions) on the home page."
 */
const AnimatedStatCounter = ({ 
  value, 
  label, 
  suffix = '', 
  prefix = '',
  duration = 1.8,
  delay = 0,
  icon = null,
  color = '#009999'
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionValue, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1], // Spring-like easing
      onUpdate: (latest) => {
        setDisplayValue(
          latest >= 1000 
            ? (latest / 1000).toFixed(1) + 'K'
            : Math.round(latest).toLocaleString()
        );
      }
    });

    return () => controls.stop();
  }, [isInView, value, duration, delay, motionValue]);

  return (
    <motion.div
      ref={ref}
      className="stats-counter-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{ cursor: 'default' }}
    >
      {/* Icon */}
      {icon && (
        <div style={{
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
          filter: `drop-shadow(0 0 8px ${color}80)`
        }}>
          {icon}
        </div>
      )}

      {/* Animated number */}
      <motion.span
        className="stats-counter-value"
        style={{
          background: `linear-gradient(135deg, ${color === '#009999' ? '#00c8c8' : '#ff8c2a'}, #ffffff)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {prefix}{displayValue}{suffix}
      </motion.span>

      {/* Label */}
      <span className="stats-counter-label">{label}</span>

      {/* Bottom accent line */}
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: '60%' } : { width: 0 }}
        transition={{ duration: 1, delay: delay + 0.4, ease: 'easeOut' }}
        style={{
          height: '2px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
          borderRadius: '2px',
          margin: '0.75rem auto 0',
        }}
      />
    </motion.div>
  );
};

export default AnimatedStatCounter;
