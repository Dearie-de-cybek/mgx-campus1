'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Office photograph's true pixel dimensions — drives both the displayed
// aspect ratio and the scroll distance, so the journey through the image
// is proportional to its actual height rather than an arbitrary viewport span.
const IMAGE_WIDTH = 3584;
const IMAGE_HEIGHT = 5376;
const IMAGE_ASPECT = IMAGE_HEIGHT / IMAGE_WIDTH;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentLeftRef = useRef<HTMLDivElement>(null);
  const contentRightRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Mobile browsers resize the viewport mid-scroll as the address bar
    // collapses/expands — without these, that resize fires a refresh in the
    // middle of the pinned journey and the scrub jumps/detaches. normalizeScroll
    // also unifies touch vs. wheel input and fixes iOS rubber-band pin glitches.
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const stage = stageRef.current;
    const imageWrap = imageWrapRef.current;
    if (!stage || !imageWrap) return;

    const ctx = gsap.context(() => {
      // The image is rendered at full stage width, so its displayed height is
      // stage width × its natural aspect ratio. The scrollable distance is
      // however much of that height extends beyond one viewport — i.e. exactly
      // how far we need to travel to reveal the image from top to bottom.
      const getScrollDistance = () => {
        const displayedHeight = stage.offsetWidth * IMAGE_ASPECT;
        return Math.max(displayedHeight - window.innerHeight, window.innerHeight * 0.6);
      };

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const distance = getScrollDistance();

          // Background plane — descends through the full frame, top to bottom,
          // as if the viewer is falling through the scene.
          gsap.set(imageWrap, { y: -progress * distance });

          // Headline — sits closer to camera, recedes faster and dissolves
          // early to hand the scene over to the supporting copy.
          if (headlineRef.current) {
            gsap.set(headlineRef.current, {
              y: -progress * 160,
              scale: 1 - progress * 0.2,
              opacity: 1 - Math.min(progress / 0.55, 1),
            });
          }

          // Foreground copy — drifts in at its own, slower rate, creating a
          // distinct depth layer between headline and background.
          const copyProgress = Math.min(progress / 0.7, 1);
          if (contentLeftRef.current) {
            gsap.set(contentLeftRef.current, {
              y: (1 - copyProgress) * 60,
              opacity: copyProgress,
            });
          }
          if (contentRightRef.current) {
            gsap.set(contentRightRef.current, {
              y: (1 - copyProgress) * 90,
              opacity: copyProgress,
            });
          }

          // Exit blackout — eases the scene to black in the final stretch so
          // the pin releases into the next chapter without any hard cut.
          if (exitOverlayRef.current) {
            const exitStart = 0.82;
            const exitProgress = progress <= exitStart ? 0 : (progress - exitStart) / (1 - exitStart);
            gsap.set(exitOverlayRef.current, { opacity: exitProgress });
          }

          // Nav — liquid-glass intensifies early, then holds steady for the
          // remainder of the descent.
          if (headerRef.current) {
            const navProgress = Math.min(progress / 0.4, 1);
            const blur = `blur(${navProgress * 18}px) saturate(${1 + navProgress * 0.8})`;
            headerRef.current.style.backdropFilter = blur;
            headerRef.current.style.setProperty('-webkit-backdrop-filter', blur);
            headerRef.current.style.backgroundColor = `rgba(255, 255, 255, ${navProgress * 0.08})`;
            headerRef.current.style.borderBottomColor = `rgba(255, 255, 255, ${navProgress * 0.12})`;
          }
        },
      });

      return () => trigger.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-zinc-950 text-white">
      <div ref={stageRef} className="relative w-full h-dvh overflow-hidden">

        {/* Background plane — image kept at its true aspect ratio and
            translated upward through scroll, so its full height is gradually
            revealed rather than cropped to the viewport. */}
        <div ref={imageWrapRef} className="absolute inset-x-0 top-0 w-full will-change-transform">
          <Image
            src="/images/office.jpg"
            alt="MGX Campus building render"
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            priority
            sizes="100vw"
            className="w-full h-auto select-none pointer-events-none"
          />
        </div>

        {/* Scrim — gradient overlay so text stays readable over the photo at
            every scroll position (darkest at the edges where copy lives). */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/55 via-black/20 to-black/70 pointer-events-none" />

        {/* Navigation Bar — liquid-glass effect intensifies with scroll. */}
        <header
          ref={headerRef}
          className="absolute top-0 w-full z-40 px-6 py-4 flex items-center justify-between border-b border-transparent transition-colors duration-300"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center font-bold text-lg tracking-tighter text-zinc-900">M</div>
            <span className="font-bold tracking-widest text-sm uppercase text-white">MGX CAMPUS</span>
          </div>
          <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-white/70 font-medium">
            <a href="#about" className="hover:text-white transition-colors duration-200">About</a>
            <a href="#impact" className="hover:text-white transition-colors duration-200">Impact</a>
            <a href="#projects" className="hover:text-white transition-colors duration-200">Products</a>
            <a href="#contact" className="hover:text-white transition-colors duration-200">Contact</a>
          </nav>
          <a href="#consultation" className="px-4 py-2 border border-white/30 rounded-md text-xs uppercase tracking-wider hover:bg-white hover:text-zinc-900 transition-all duration-300 font-semibold text-white">
            Explore Hub
          </a>
        </header>

        {/* Headline — overlaid on the image, recedes into depth as you scroll. */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20 px-6">
          <h1
            ref={headlineRef}
            className="text-[12vw] md:text-[9vw] font-black tracking-tighter text-white font-sans text-center leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)] will-change-transform"
          >
            MGX RESEARCH
          </h1>
        </div>

        {/* Foreground Content — split across both sides of the grid, each
            drifting in at a slightly different rate for added parallax depth. */}
        <div className="absolute inset-x-0 bottom-10 md:bottom-16 z-30 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 pointer-events-none">
          <div ref={contentLeftRef} className="flex flex-col gap-2 will-change-transform">
            <span className="text-xs uppercase tracking-widest text-white/60 font-bold font-mono">Enugu Tech Innovation Hub</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white">
              Driving Governance &amp; Innovation
            </h2>
          </div>

          <div ref={contentRightRef} className="flex flex-col gap-4 md:items-end md:text-right will-change-transform">
            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
              MGX builds digital public infrastructure that brings research-grade thinking to governance — transforming how services reach people across Nigeria.
            </p>
            <div className="flex gap-4">
              <a href="#impact" className="pointer-events-auto px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-900 rounded-md text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-sm">
                Our Products
              </a>
              <a href="#about" className="pointer-events-auto px-6 py-3 border border-white/30 hover:border-white text-white rounded-md text-xs uppercase tracking-widest font-bold transition-all duration-300 backdrop-blur-[12px]">
                Read Research
              </a>
            </div>
          </div>
        </div>

        {/* Exit blackout — fades the scene to black in the final stretch of
            the descent, so the pin releases straight into the next chapter
            with no jump, overlap, or hard cut. */}
        <div ref={exitOverlayRef} className="absolute inset-0 z-50 bg-zinc-950 opacity-0 pointer-events-none" />
      </div>
    </section>
  );
}
