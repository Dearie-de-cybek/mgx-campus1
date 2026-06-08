'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Arc layout — cards sit along the rim of a circle. Each one is rotated to
// the tangent of its position on that circle, dips slightly with the curve,
// and grows the further it sits from centre — so the row reads as a gentle
// circular sweep rather than a flat strip, with the centre receding smaller
// and the ends looming larger, just like the rim of a wheel curving toward you.
const ARC_ANGLES = [-38, -25, -12, 0, 12, 25, 38];
const ARC_RADIUS = 860;
const ARC_MAX_ANGLE = 38;
const CARD_SOURCES = [
  '/images/office2.jpg',
  '/images/office.jpg',
  '/images/office2.jpg',
  '/images/office.jpg',
  '/images/office2.jpg',
  '/images/office.jpg',
  '/images/office2.jpg',
];

const ARC_CARDS = ARC_ANGLES.map((angle, i) => {
  const rad = (angle * Math.PI) / 180;
  return {
    src: CARD_SOURCES[i],
    angle,
    x: ARC_RADIUS * Math.sin(rad),
    y: ARC_RADIUS * (1 - Math.cos(rad)),
    scale: 0.66 + (Math.abs(angle) / ARC_MAX_ANGLE) * 0.56,
    z: 100 - Math.round(Math.abs(angle)),
  };
});

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Copy rises into place as the section opens — the "new chapter" reveal
      // handing off from the Hero's blackout.
      gsap.from([eyebrowRef.current, headingRef.current, subRef.current, ctaRef.current], {
        y: 56,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 38%',
          scrub: 1,
        },
      });

      // Cards swing up into the arc from below, each settling at its resting tilt.
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          y: 140,
          opacity: 0,
          scale: 0.85,
          delay: i * 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'top 20%',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-amber-300 text-zinc-900 py-28 md:py-36">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-6">
        <div ref={eyebrowRef} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-zinc-900/70">
          <span className="w-2 h-2 bg-zinc-900 inline-block" />
          About MGX Campus
        </div>
        <h2 ref={headingRef} className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl">
          Research-grade infrastructure that transforms how governance reaches people
        </h2>
        <p ref={subRef} className="text-zinc-900/70 text-base md:text-lg max-w-2xl leading-relaxed">
          MGX Campus brings researchers, engineers and policy thinkers together to design digital public infrastructure for Nigeria — turning rigorous ideas into services people can trust.
        </p>
        <a
          ref={ctaRef}
          href="#impact"
          className="mt-2 inline-flex items-center gap-3 pl-6 pr-2 py-2 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors duration-300"
        >
          Learn more
          <span className="w-9 h-9 rounded-full bg-white text-zinc-900 flex items-center justify-center text-base">→</span>
        </a>
      </div>

      {/* Arc of cards along a circle's rim — centre recedes, ends loom larger */}
      <div className="relative mt-24 md:mt-32 h-[380px] md:h-[560px] flex items-start justify-center overflow-x-clip">
        {ARC_CARDS.map((card, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              transform: `translateX(${card.x}px) translateY(${card.y}px) rotate(${card.angle}deg) scale(${card.scale})`,
              zIndex: card.z,
            }}
          >
            <div
              ref={(el) => { cardRefs.current[i] = el; }}
              className="relative w-[100px] md:w-[150px] aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-2xl"
            >
              <Image src={card.src} alt="MGX Campus building" fill sizes="150px" className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      {/* Caption beneath the arc — anchors the composition with social proof */}
      <div className="relative mt-6 md:mt-10 flex flex-col items-center gap-3 text-center">
        <p className="text-zinc-900/70 text-sm md:text-base font-medium">
          Rated 4.9/5 by 2,300+ partners and collaborators
        </p>
        <div className="flex gap-1 text-amber-600">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
              <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.77l-5.18 2.67.99-5.77L1.62 7.6l5.79-.84L10 1.5z" />
            </svg>
          ))}
        </div>
      </div>
    </section>
  );
}
