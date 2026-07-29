import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import CosmicJourney from '@/three/intro/CosmicJourney';
import { Sparkles, Rocket } from 'lucide-react';

type Props = {
  onEnter: () => void;
  entering: boolean;
};

// The cinematic intro overlay. Shows the cosmic journey 3D scene behind a
// "begin the adventure" prompt. When the user clicks enter, the journey
// accelerates (progress ramps to 1) and the overlay fades out.
export default function IntroOverlay({ onEnter, entering }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [launched, setLaunched] = useState(false);
  const progressRef = useRef(0);

  // Accelerate the journey after launch
  useEffect(() => {
    if (!launched) return;
    let raf = 0;
    const tick = () => {
      progressRef.current = Math.min(1, progressRef.current + 0.012);
      if (progressRef.current < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [launched]);

  const handleEnter = () => {
    setLaunched(true);
    onEnter();
    window.setTimeout(() => setLeaving(true), 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 ${
        leaving || entering ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D cosmic journey */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 75, near: 0.1, far: 400 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#05060d']} />
          <CosmicJourney progressRef={progressRef} />
          <EffectComposer>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.7} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/30 bg-white/5 backdrop-blur-xl">
            <div className="absolute inset-0 rounded-full bg-cyan-300/10 blur-xl" />
            <Rocket className="relative h-8 w-8 text-cyan-200" strokeWidth={1.4} />
          </div>
        </div>

        <p className="mb-3 text-xs uppercase tracking-[0.5em] text-cyan-200/70">
          Welcome to
        </p>
        <h1 className="font-serif text-6xl font-light text-white sm:text-7xl">
          <span className="italic text-cyan-100">Aetheria</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
          A luxury dining experience suspended among the stars. Board the vessel
          and journey through galaxies to a restaurant at the edge of the
          cosmos.
        </p>

        <button
          onClick={handleEnter}
          className="group mt-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-white/90 backdrop-blur-xl transition-all duration-500 hover:border-cyan-200/50 hover:bg-cyan-200/10 hover:tracking-[0.35em]"
        >
          <Sparkles className="h-4 w-4 text-cyan-200" strokeWidth={1.5} />
          {launched ? 'Traveling...' : 'Begin the Journey'}
        </button>

        <p className="mt-6 text-[11px] text-white/30">
          Best experienced with sound on · Use headphones for full immersion
        </p>
      </div>
    </div>
  );
}
