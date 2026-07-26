import React, { useCallback, useMemo } from 'react';
import { Camera, Eye, Heart } from 'lucide-react';
import { useUiStore } from '../../state/uiStore';
import { useRendererStore } from '../../state/rendererStore';
import { useCameraStore } from '../../state/cameraStore';
import { GlitchText } from '../../GlitchText';
import { MusicButton } from '../controls/MusicButton';
import { APP_FONT_FAMILY, STEPS_MIN, STEPS_MAX, DIST_MIN, DIST_MAX, GLITCH_BASE_SPEED, VERSION_LABELS } from '../../utils/constants';

const SLIDER_CLASS = 'h-1 appearance-none bg-pink-500/20 rounded-full outline-none accent-pink-500 cursor-pointer';

export const TopBar = React.memo(() => {
  const toggleHud = useUiStore((s) => s.toggleHud);
  const resetCamera = useCameraStore((s) => s.resetCamera);
  const handleResetCamera = useCallback(() => {
    resetCamera();
    window.dispatchEvent(new CustomEvent('riftpane:reset-camera'));
  }, [resetCamera]);
  const handleResetSliders = useCallback(() => {
    useRendererStore.getState().resetSettings();
  }, []);
  const setVersionIdx = useRendererStore((s) => s.setVersionIdx);
  const setShowDisclaimer = useUiStore((s) => s.setShowDisclaimer);

  const stepCount = useRendererStore((s) => s.steps);
  const maxDist = useRendererStore((s) => s.maxDist);
  const snowDensity = useRendererStore((s) => s.snowDensity);
  const diffractionIntensity = useRendererStore((s) => s.diffractionIntensity);
  const fps = useRendererStore((s) => s.fps);
  const setSteps = useRendererStore((s) => s.setSteps);
  const setMaxDist = useRendererStore((s) => s.setMaxDist);
  const setSnowDensity = useRendererStore((s) => s.setSnowDensity);
  const setDiffractionIntensity = useRendererStore((s) => s.setDiffractionIntensity);

  const qualityJobs = useMemo(() => [
    { label: 'STEPS', value: stepCount, set: setSteps, min: STEPS_MIN, max: STEPS_MAX, step: 1 },
    { label: 'DIST', value: maxDist, set: setMaxDist, min: DIST_MIN, max: DIST_MAX, step: 5 },
    { label: 'SNOW', value: snowDensity, set: setSnowDensity, min: 0, max: 0.04, step: 0.001 },
    { label: 'DIFFRACTION', value: diffractionIntensity, set: setDiffractionIntensity, min: 0, max: 20.0, step: 0.1 },
  ], [stepCount, maxDist, snowDensity, diffractionIntensity]);

  const versionLabels = VERSION_LABELS;
  const activeVersionIdx = useRendererStore((s) => s.activeVersionIdx);

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 bg-[#120a1f]/50 hover:bg-[#120a1f]/85 backdrop-blur-md border-b border-pink-500/30 px-2 sm:px-3 py-1.5 sm:py-2 pointer-events-auto shadow-[0_0_20px_rgba(255,42,75,0.15)] transition-colors duration-200">
      {/* Versions */}
      <div className="flex items-center gap-1">
        {versionLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setVersionIdx(i)}
            title={label.toUpperCase()}
            className="w-7 h-7 rounded-full text-[11px] font-bold transition flex items-center justify-center shrink-0"
            style={{
              fontFamily: APP_FONT_FAMILY,
              ...(i === activeVersionIdx
                ? { background: 'linear-gradient(to top right, #c81e4f, #ff477e)', color: '#fff', boxShadow: '0 0 10px rgba(255,42,75,0.8)' }
                : { background: 'rgba(0,0,0,0.4)', color: 'rgba(255,200,210,0.5)' }),
            }}
          >
            <span style={{ marginTop: '2px', display: 'inline-flex' }}>
              <GlitchText text={label} speed={GLITCH_BASE_SPEED} />
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <button onClick={handleResetSliders} title="Reset sliders" className="p-1 rounded-full bg-white/5 hover:bg-white/20 transition hover:scale-110 active:scale-95 shrink-0" style={{ color: '#ff7080' }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>

        <span className="text-[9px] font-bold min-w-[36px] text-center tabular-nums shrink-0" style={{ color: '#ff477e' }}>
          {fps} FPS
        </span>

        {qualityJobs.map((job) => {
          const isDiffraction = job.label === 'DIFFRACTION';
          return (
            <div key={job.label} className="flex items-center gap-1">
              <span className="text-[8px] text-pink-300/60 font-semibold uppercase tracking-wider">{job.label}</span>
              <input
                type="range"
                min={job.min}
                max={job.max}
                step={job.step}
                value={job.value}
                onChange={(e) => job.set(Number(e.target.value))}
                className={`${isDiffraction ? 'w-12' : 'w-8'} ${SLIDER_CLASS}`}
              />
              <span className="text-[8px] text-pink-200/60 font-mono min-w-[16px] text-right">{job.value.toFixed(job.step < 1 ? 2 : 0)}</span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={handleResetCamera} title="Reset Camera" className="p-1 rounded-full bg-white/5 hover:bg-white/20 transition hover:scale-110 active:scale-95 shrink-0" style={{ color: '#ff7080' }}>
          <Camera className="w-3.5 h-3.5" />
        </button>
        <MusicButton src="./audio/riftpane.mp3" />
        <button onClick={toggleHud} title="Hide Controls" className="p-1 rounded-full bg-white/5 hover:bg-white/20 transition hover:scale-110 active:scale-95 shrink-0" style={{ color: '#ff7080' }}>
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Credit: fan art + GitHub + Heart */}
      <div className="flex items-center gap-1">
        <span className="text-[8px] text-pink-300/40 uppercase font-semibold whitespace-nowrap hidden md:inline-block w-20 text-center truncate" style={{ fontFamily: APP_FONT_FAMILY, lineHeight: 1 }}>
          <GlitchText text="fan art project" speed={GLITCH_BASE_SPEED} />
        </span>
        <a href="https://github.com/sakurablush/riftpane" target="_blank" rel="noreferrer" className="shrink-0 p-1 rounded-full bg-white/5 hover:bg-white/20 transition hover:scale-110 active:scale-95 text-pink-300/50 hover:text-white" title="GitHub">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-3.99-1.425-.135-.345-.72-1.425-1.23-1.71-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <button onClick={() => setShowDisclaimer(true)} className="text-pink-300/50 hover:text-pink-400 transition hover:scale-110 active:scale-95 shrink-0" title="Disclaimer">
          <Heart className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});
