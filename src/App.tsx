import { useEffect, useRef, useState, useCallback } from 'react';
import { AmbientEngine } from '@/audio/ambientEngine';
import { AudioController, type SectionId } from '@/audio/audioController';
import AmbientPlayer from '@/components/AmbientPlayer';
import IntroOverlay from '@/components/IntroOverlay';
import RestaurantExperience from '@/components/RestaurantExperience';

function App() {
  const [entered, setEntered] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [audio, setAudio] = useState<AudioController | null>(null);
  const engineRef = useRef<AmbientEngine | null>(null);

  useEffect(() => {
    return () => {
      audio?.stop();
    };
  }, [audio]);

  const handleEnter = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new AmbientEngine({ masterVolume: 0.5 });
    }
    const controller = new AudioController(engineRef.current);
    controller.start();
    setAudio(controller);
    setEntered(true);
    window.setTimeout(() => setShowIntro(false), 2200);
  }, []);

  const handleSectionChange = useCallback(
    (section: SectionId) => {
      audio?.setSection(section);
    },
    [audio]
  );

  return (
    <>
      {showIntro && (
        <IntroOverlay onEnter={handleEnter} entering={entered} />
      )}
      {entered && (
        <>
          <RestaurantExperience audio={audio} onSectionChange={handleSectionChange} />
          <AmbientPlayer audio={audio} />
        </>
      )}
    </>
  );
}

export default App;
