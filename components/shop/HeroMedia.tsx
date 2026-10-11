'use client';

import { useEffect, useState } from 'react';
import { imgProps } from '@/lib/img';

/**
 * Fond du bandeau vidéo : l'affiche (image) s'affiche immédiatement,
 * puis la vidéo est chargée seulement pour l'écran concerné (ordinateur OU mobile, jamais les deux).
 */
export default function HeroMedia({ video, poster, media }: { video?: string; poster?: string; media: string }) {
  const [play, setPlay] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!video) return;
    const mq = window.matchMedia(media);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const update = () => setPlay(mq.matches && !calm && !save);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [video, media]);

  return (
    <>
      {poster && <img className="poster" {...imgProps(poster, '100vw', true)} alt="" />}
      {play && (
        <video
          autoPlay muted loop playsInline preload="auto"
          poster={poster || undefined}
          onCanPlay={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: 'opacity .8s ease' }}
        >
          <source src={video} type="video/mp4" />
        </video>
      )}
    </>
  );
}
