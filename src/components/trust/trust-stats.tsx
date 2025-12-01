'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TrustStat {
  /** Unique identifier */
  id: string;
  /** Display value (e.g., "15+", "98%", "10M+") */
  value: string;
  /** Label text */
  label: string;
  /** Optional numeric value for animation */
  numericValue: number | undefined;
  /** Optional suffix (e.g., "+", "%", "M+") */
  suffix: string | undefined;
}

export interface TrustStatsProps {
  /** Section title */
  title: string | undefined;
  /** Stats to display */
  stats: TrustStat[];
  /** Use animated counters */
  animated?: boolean;
  /** Custom class name */
  className?: string;
}

// Animated counter hook
function useAnimatedCounter(
  target: number,
  duration: number = 2000,
  enabled: boolean = true,
): number {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || hasAnimated) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries.at(0);
        if (firstEntry?.isIntersecting === true && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = target / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.1 },
    );

    const currentElement = elementRef.current;
    if (currentElement !== null) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement !== null) {
        observer.unobserve(currentElement);
      }
    };
  }, [target, duration, enabled, hasAnimated]);

  return count;
}

// Single stat item component
interface StatItemProps {
  stat: TrustStat;
  animated: boolean;
}

function StatItem({ stat, animated }: StatItemProps) {
  const animatedValue = useAnimatedCounter(
    stat.numericValue ?? 0,
    2000,
    animated && stat.numericValue !== undefined,
  );

  const displayValue =
    animated && stat.numericValue !== undefined
      ? `${animatedValue}${stat.suffix ?? ''}`
      : stat.value;

  return (
    <div className='text-center'>
      <div className='mb-2 text-4xl font-bold text-primary'>{displayValue}</div>
      <div className='text-sm text-muted-foreground'>{stat.label}</div>
    </div>
  );
}

/**
 * Trust stats section component.
 * Displays key business metrics with optional animation.
 */
export function TrustStats({
  title,
  stats,
  animated = false,
  className,
}: TrustStatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className={cn('bg-muted/30 py-12 md:py-16', className)}>
      <div className='container mx-auto px-4'>
        {title !== undefined && (
          <h2 className='mb-10 text-center text-2xl font-bold'>{title}</h2>
        )}

        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => (
            <StatItem
              key={stat.id}
              stat={stat}
              animated={animated}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
