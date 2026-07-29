import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import RestaurantInterior from '@/three/restaurant/RestaurantInterior';
import HolographicMenu from '@/three/menu/HolographicMenu';
import VirtualTour from '@/three/tour/VirtualTour';
import EntertainmentZone from '@/three/entertainment/EntertainmentZone';
import GalleryScene from '@/three/gallery/GalleryScene';
import type { AudioController, SectionId } from '@/audio/audioController';
import {
  UtensilsCrossed,
  Wine,
  Sparkles,
  Clock,
  MapPin,
  Gamepad2,
  Compass,
  Images,
  CalendarCheck,
  RotateCw,
  Pause,
  ChevronDown,
} from 'lucide-react';

type Props = {
  audio: AudioController | null;
  onSectionChange: (section: SectionId) => void;
};

type ActiveScene = 'hero' | 'menu' | 'tour' | 'entertainment' | 'gallery';

const DISHES = [
  { name: 'Nebula Overture', desc: 'Smoked caviar pearls in citrus-mist consommé', pairing: 'Brut Champagne, 2018', color: '#22d3ee' },
  { name: 'Lunar Scallop', desc: 'Hand-dived scallop, golden oscietra, brown butter', pairing: 'Chablis Premier Cru', color: '#fbbf24' },
  { name: 'Orbit Wagyu', desc: 'A5 wagyu, black garlic purée, juniper reduction', pairing: 'Barolo, 2016', color: '#e879f9' },
  { name: 'Stellar Soufflé', desc: 'Yuzu soufflé, white chocolate ganache, violet', pairing: 'Tokaji Aszú 5 Puttonyos', color: '#5eead4' },
];

export default function RestaurantExperience({ audio, onSectionChange }: Props) {
  const [activeScene, setActiveScene] = useState<ActiveScene>('hero');
  const [dishIndex, setDishIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sectionRefs = useRef<Record<ActiveScene, HTMLElement | null>>({
    hero: null,
    menu: null,
    tour: null,
    entertainment: null,
    gallery: null,
  });

  // Track mouse for 3D parallax
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Scroll-spy to switch active 3D scene + audio section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const id = entry.target.id as ActiveScene;
            if (id && id !== activeScene) {
              setActiveScene(id);
              const sectionMap: Record<ActiveScene, SectionId> = {
                hero: 'hero',
                menu: 'menu',
                tour: 'tour',
                entertainment: 'entertainment',
                gallery: 'gallery',
              };
              onSectionChange(sectionMap[id]);
            }
          }
        });
      },
      { threshold: [0.4, 0.6] }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeScene, onSectionChange]);

  const playHover = useCallback(() => audio?.playHover(), [audio]);
  const playClick = useCallback(() => audio?.playClick(), [audio]);

  const scrollToSection = (id: string) => {
    audio?.playClick();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-[#05060d] text-white">
      {/* Fixed 3D canvas background */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 2, 14], fov: 60, near: 0.1, far: 400 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#05060d']} />
          {activeScene === 'hero' && <RestaurantInterior mouseRef={mouseRef} />}
          {activeScene === 'menu' && (
            <group position={[0, 0, 0]}>
              <HolographicMenu dishIndex={dishIndex} autoRotate={autoRotate} />
            </group>
          )}
          {activeScene === 'tour' && <VirtualTour mouseRef={mouseRef} />}
          {activeScene === 'entertainment' && <EntertainmentZone mouseRef={mouseRef} />}
          {activeScene === 'gallery' && <GalleryScene mouseRef={mouseRef} />}
          <EffectComposer>
            <Bloom
              intensity={1.0}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.25} darkness={0.6} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Scrollable content sections overlaid on the 3D canvas */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 backdrop-blur-md sm:px-12">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-200" strokeWidth={1.5} />
            <span className="font-serif text-lg italic tracking-wide text-cyan-50">
              Aetheria
            </span>
          </div>
          <div className="hidden gap-6 text-xs uppercase tracking-[0.2em] text-white/50 md:flex">
            <button onMouseEnter={playHover} onClick={() => scrollToSection('hero')} className="transition-colors hover:text-cyan-200">Home</button>
            <button onMouseEnter={playHover} onClick={() => scrollToSection('menu')} className="transition-colors hover:text-cyan-200">Menu</button>
            <button onMouseEnter={playHover} onClick={() => scrollToSection('tour')} className="transition-colors hover:text-cyan-200">Tour</button>
            <button onMouseEnter={playHover} onClick={() => scrollToSection('entertainment')} className="transition-colors hover:text-cyan-200">Play</button>
            <button onMouseEnter={playHover} onClick={() => scrollToSection('gallery')} className="transition-colors hover:text-cyan-200">Gallery</button>
            <button onMouseEnter={playHover} onClick={() => scrollToSection('reservation')} className="transition-colors hover:text-cyan-200">Reserve</button>
          </div>
          <button
            onMouseEnter={playHover}
            onClick={() => scrollToSection('reservation')}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur-md transition-all hover:border-cyan-200/50 hover:bg-cyan-200/10"
          >
            Reserve
          </button>
        </nav>

        {/* HERO SECTION */}
        <section
          id="hero"
          ref={(el) => { sectionRefs.current.hero = el; }}
          className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="relative z-10 mt-16">
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-cyan-200/70">
              Eighteen seats · One orbit
            </p>
            <h1 className="max-w-4xl font-serif text-5xl font-light leading-tight text-white sm:text-7xl">
              A restaurant <span className="italic text-cyan-100">floating</span> in
              the silence of space
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/60">
              You have arrived at Aetheria — a luxury vessel orbiting at the edge
              of the atmosphere. Explore the dining hall, meet our crew, and
              journey through a living galaxy of taste.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onMouseEnter={playHover}
                onClick={() => scrollToSection('menu')}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-200/90 px-7 py-3 text-xs uppercase tracking-[0.25em] text-slate-900 transition-all hover:bg-cyan-100"
              >
                <UtensilsCrossed className="h-4 w-4" strokeWidth={1.6} />
                Explore the Menu
              </button>
              <button
                onMouseEnter={playHover}
                onClick={() => scrollToSection('tour')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur-md transition-all hover:border-cyan-200/50 hover:bg-white/5"
              >
                <Compass className="h-4 w-4" strokeWidth={1.6} />
                Take the Tour
              </button>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
            <ChevronDown className="h-6 w-6" />
          </div>
        </section>

        {/* INTERACTIVE MENU */}
        <section
          id="menu"
          ref={(el) => { sectionRefs.current.menu = el; }}
          className="relative flex min-h-screen items-center px-6 py-24 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />
          <div className="relative z-10 grid w-full gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/60">
                Holographic Tasting Journey
              </p>
              <h2 className="mt-3 font-serif text-4xl font-light text-white sm:text-5xl">
                Nine courses, one orbit
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
                Each dish is projected as a living hologram. Rotate it, examine
                every detail, and discover the pairing chosen by our sommelier
                droids.
              </p>

              {/* Dish selector */}
              <div className="mt-8 space-y-3">
                {DISHES.map((dish, i) => (
                  <button
                    key={i}
                    onMouseEnter={playHover}
                    onClick={() => {
                      setDishIndex(i);
                      audio?.playHologram();
                    }}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                      dishIndex === i
                        ? 'border-cyan-200/40 bg-white/[0.06]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm"
                      style={{
                        border: `1px solid ${dish.color}55`,
                        color: dish.color,
                        boxShadow: dishIndex === i ? `0 0 16px ${dish.color}44` : 'none',
                      }}
                    >
                      {['I', 'II', 'III', 'IV'][i]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-white">{dish.name}</h3>
                      <p className="text-xs text-white/50">{dish.desc}</p>
                    </div>
                    <Wine className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: dish.color }} />
                    <span className="hidden text-xs italic text-white/40 sm:inline">{dish.pairing}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onMouseEnter={playHover}
                  onClick={() => { setAutoRotate(!autoRotate); audio?.playClick(); }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-wider text-white/70 transition-all hover:border-cyan-200/40"
                >
                  {autoRotate ? <Pause className="h-3.5 w-3.5" /> : <RotateCw className="h-3.5 w-3.5" />}
                  {autoRotate ? 'Pause rotation' : 'Auto-rotate'}
                </button>
                <span className="text-xs text-white/40">Drag the hologram to rotate manually</span>
              </div>
            </div>

            {/* 3D hologram is rendered in the fixed canvas; this side is intentionally open */}
            <div className="hidden lg:block" />
          </div>
        </section>

        {/* VIRTUAL TOUR */}
        <section
          id="tour"
          ref={(el) => { sectionRefs.current.tour = el; }}
          className="relative flex min-h-screen items-center px-6 py-24 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/70 via-transparent to-black/30" />
          <div className="relative z-10 ml-auto max-w-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/60">
              360° Virtual Tour
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light text-white sm:text-5xl">
              Explore every deck
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              The camera glides through the Grand Dining Hall, VIP Capsule
              Lounge, Galaxy View Terrace, and Observation Deck. Move your mouse
              to shift the view as you travel.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: <UtensilsCrossed className="h-4 w-4" />, label: 'Grand Dining Hall' },
                { icon: <Sparkles className="h-4 w-4" />, label: 'VIP Capsule Lounge' },
                { icon: <Compass className="h-4 w-4" />, label: 'Galaxy View Terrace' },
                { icon: <Wine className="h-4 w-4" />, label: 'Observation Deck' },
              ].map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={playHover}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:border-cyan-200/30"
                >
                  <span className="text-cyan-200">{item.icon}</span>
                  <span className="text-sm text-white/70">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENTERTAINMENT AREA */}
        <section
          id="entertainment"
          ref={(el) => { sectionRefs.current.entertainment = el; }}
          className="relative flex min-h-screen items-center px-6 py-24 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />
          <div className="relative z-10 max-w-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/60">
              Entertainment Zone
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light text-white sm:text-5xl">
              Adventure among the stars
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Beyond the dining hall lies a universe of play — holographic game
              pods, galaxy rooms, and family adventure zones orbit the central
              carousel.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: <Gamepad2 className="h-5 w-5" />, title: 'Holographic Game Pods', desc: 'Six interactive stations with immersive play' },
                { icon: <Sparkles className="h-5 w-5" />, title: 'Galaxy Rooms', desc: 'Step through portals into themed cosmic worlds' },
                { icon: <Compass className="h-5 w-5" />, title: 'Family Adventure Zones', desc: 'Zero-gravity play areas for all ages' },
              ].map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={playHover}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-cyan-200/30"
                >
                  <span className="mt-0.5 text-cyan-200">{item.icon}</span>
                  <div>
                    <h3 className="font-serif text-lg text-white">{item.title}</h3>
                    <p className="text-xs text-white/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section
          id="gallery"
          ref={(el) => { sectionRefs.current.gallery = el; }}
          className="relative flex min-h-screen items-center px-6 py-24 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/60">
              Cinematic Gallery
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light text-white sm:text-5xl">
              Moments from the void
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              A rotating exhibition of luxury dining moments and space adventure
              experiences, rendered as living holographic frames.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: <Images className="h-4 w-4" />, label: 'Aurora Tasting' },
                { icon: <Sparkles className="h-4 w-4" />, label: 'VIP Capsule' },
                { icon: <Wine className="h-4 w-4" />, label: 'Galaxy Lounge' },
                { icon: <UtensilsCrossed className="h-4 w-4" />, label: 'Chef at Work' },
                { icon: <Compass className="h-4 w-4" />, label: 'Orbital Toast' },
                { icon: <Gamepad2 className="h-4 w-4" />, label: 'Starlight Dance' },
              ].map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={playHover}
                  onClick={() => audio?.playHologram()}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60 backdrop-blur-sm transition-all hover:border-cyan-200/30 hover:text-white"
                >
                  <span className="text-cyan-200">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESERVATION */}
        <section
          id="reservation"
          className="relative flex min-h-screen items-center justify-center px-6 py-24 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="relative z-10 w-full max-w-2xl">
            <div className="rounded-3xl border border-cyan-200/20 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 backdrop-blur-xl sm:p-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-200/5">
                  <CalendarCheck className="h-6 w-6 text-cyan-200" strokeWidth={1.5} />
                </div>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/60">
                  Holographic Reservation
                </p>
                <h2 className="mt-3 font-serif text-4xl font-light text-white">
                  Reserve your orbit
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm text-white/55">
                  Seatings are limited to eighteen guests per evening. Configure
                  your journey below.
                </p>
              </div>

              <form
                className="mt-8 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  audio?.playTransition();
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <HoloInput label="Guest Name" placeholder="Commander Vega" onMouseEnter={playHover} />
                  <HoloInput label="Email" placeholder="you@galaxy.io" type="email" onMouseEnter={playHover} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <HoloSelect label="Seating" options={['Sunset Orbit · 7:00 PM', 'Midnight Orbit · 10:00 PM', 'Deep Space · 12:00 AM']} onMouseEnter={playHover} />
                  <HoloSelect label="Party Size" options={['1 Guest', '2 Guests', '4 Guests', '6 Guests', 'Private Capsule (8)']} onMouseEnter={playHover} />
                </div>
                <HoloSelect label="Experience" options={['Dining Only', 'Dining + Virtual Tour', 'Dining + Entertainment Zone', 'Full Cosmic Adventure']} onMouseEnter={playHover} />

                <button
                  type="submit"
                  onMouseEnter={playHover}
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-8 py-4 text-xs uppercase tracking-[0.3em] text-slate-900 transition-all hover:from-cyan-200 hover:to-teal-200"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={1.6} />
                  Launch Reservation
                </button>
              </form>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <InfoMini icon={<Clock className="h-4 w-4" />} title="Hours" lines={['Dinner only', '7 PM — 1 AM']} />
                <InfoMini icon={<MapPin className="h-4 w-4" />} title="Departure" lines={['Terminal 7', 'Sunset ascent']} />
                <InfoMini icon={<Sparkles className="h-4 w-4" />} title="Attire" lines={['Elevated', 'Comfort']} />
              </div>
            </div>
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-xs text-white/40 sm:px-12">
          <p className="font-serif italic text-cyan-100/70">Aetheria</p>
          <p className="mt-2">Dining among the stars · Est. 2089</p>
        </footer>
      </div>
    </div>
  );
}

function HoloInput({
  label,
  placeholder,
  type = 'text',
  onMouseEnter,
}: {
  label: string;
  placeholder: string;
  type?: string;
  onMouseEnter?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-cyan-200/60">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        onMouseEnter={onMouseEnter}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-200/50"
      />
    </label>
  );
}

function HoloSelect({
  label,
  options,
  onMouseEnter,
}: {
  label: string;
  options: string[];
  onMouseEnter?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-cyan-200/60">{label}</span>
      <select
        onMouseEnter={onMouseEnter}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-200/50"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-slate-900">{o}</option>
        ))}
      </select>
    </label>
  );
}

function InfoMini({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/20 text-cyan-200">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{title}</p>
      {lines.map((l) => (
        <p key={l} className="text-xs text-white/60">{l}</p>
      ))}
    </div>
  );
}
