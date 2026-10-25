import { useEffect, useState } from 'react';
import { cn } from './ui';

const SPARKS = [
  { left: '-18%', top: '8%', size: 18, delay: 150 },
  { left: '104%', top: '-6%', size: 22, delay: 320 },
  { left: '96%', top: '62%', size: 14, delay: 480 },
];

/**
 * Opening animation shown once per app launch. It starts from the same spot as the static
 * splash in index.html (icon centred, 112px), so the hand-off is seamless:
 * the pocket "hugs" (squash & bounce), sparkles twinkle, the name rises, then everything fades out.
 * Tap to skip; Reduce Motion skips the animation.
 */
export function IntroSplash() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState<'show' | 'leave' | 'done'>('show');

  useEffect(() => {
    const t = window.setTimeout(() => setPhase((p) => (p === 'show' ? 'leave' : p)), reduce ? 250 : 1500);
    return () => window.clearTimeout(t);
  }, [reduce]);

  if (phase === 'done') return null;
  return (
    <div
      aria-hidden
      onClick={() => setPhase('leave')}
      onAnimationEnd={(e) => e.target === e.currentTarget && phase === 'leave' && setPhase('done')}
      className={cn('fixed inset-0 z-[60] flex items-center justify-center bg-bg', phase === 'leave' && 'intro-leave')}
    >
      <div className="relative">
        <img src="icons/icon-512.png" alt="" className="intro-hug h-28 w-28 rounded-[26px] shadow-[0_12px_32px_rgba(15,23,42,0.18)]" />
        {SPARKS.map((s, i) => (
          <svg key={i} viewBox="0 0 24 24" className="intro-spark absolute text-[#FBBF24]" style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: `${s.delay}ms` }}>
            <path fill="currentColor" d="M12 0c.6 5.6 2.6 9.2 12 12-9.4 2.8-11.4 6.4-12 12-.6-5.6-2.6-9.2-12-12 9.4-2.8 11.4-6.4 12-12z" />
          </svg>
        ))}
        <div className="intro-rise absolute left-1/2 top-full mt-5 whitespace-nowrap text-center">
          <p className="t-headline-lg text-ink">Kantong</p>
          <p className="t-body-sm text-sub">Rupiah & NT$ dalam satu kantong</p>
        </div>
      </div>
    </div>
  );
}
