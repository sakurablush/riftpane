import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useUiStore } from '../../state/uiStore';
import { GlitchText } from '../../GlitchText';
import { APP_FONT_FAMILY } from '../../utils/constants';

const SK = {
  pink: '#ff477e',
  rose: '#ff7080',
  border: 'rgba(255, 42, 75, 0.3)',
  bg: 'rgba(255, 42, 75, 0.08)',
};

const SakuraLink = ({ href, children, external = true }: { href: string; children: React.ReactNode; external?: boolean }) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noreferrer' : undefined}
    className="text-pink-300 underline underline-offset-2 decoration-pink-500/40 hover:decoration-pink-300 hover:text-white transition-all duration-200"
  >
    {children}
  </a>
);

export const DisclaimerModal = React.memo(() => {
  const showDisclaimer = useUiStore((s) => s.showDisclaimer);
  const setShowDisclaimer = useUiStore((s) => s.setShowDisclaimer);

  if (!showDisclaimer) return null;

  const handleDialogWheel = (e: React.WheelEvent) => {
    const target = e.currentTarget;
    const atTop = target.scrollTop <= 0;
    const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.stopPropagation();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div
        onWheel={handleDialogWheel}
        className="bg-[#120a1f] border border-pink-500/30 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs leading-relaxed text-slate-300"
      >
        <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-pink-400" />
          <h3 className="font-bold text-white text-sm tracking-wider" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
            RIFTPANE
          </h3>
          </div>
          <button onClick={() => setShowDisclaimer(false)} className="text-white/50 hover:text-white font-bold text-base px-2">
            ✕
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 text-[11px]">
          <p>
            <strong className="text-pink-300">Fan-made art project:</strong> Riftpane is a{' '}
            <SakuraLink href="https://github.com/sakurablush/riftpane">non-commercial, open-source</SakuraLink>{' '}
            real-time WebGL procedural art installation. The visuals are based on a publicly available
            interview describing layered laser-perception phenomena:{' '}
            <SakuraLink href="https://youtu.be/I4JGLyrV7cQ">
              Close Encounter Club interview
            </SakuraLink>.
            The exact rendering prompts used to build these shaders are documented in this repository:{' '}
            <SakuraLink href="https://github.com/sakurablush/riftpane/blob/main/docs/vision-prompts.md">
              docs/vision-prompts.md
            </SakuraLink>.
          </p>

          <p>
            <strong className="text-pink-300">Acknowledgements:</strong> This project was created
            with genuine admiration for the Code of Reality community — a group of people who share
            ideas openly, listen carefully, and treat each other with real kindness. Their willingness
            to keep these conversations public is what made this art piece possible.
            Special thanks to{' '}
            <SakuraLink href="https://dannygoler.com/">Danny Goler</SakuraLink>{' '}
            for cultivating that space, and to{' '}
            <SakuraLink href="https://veilbreak.ai">Project Veilbreak</SakuraLink>{' '}
            for the broader curiosity that inspired it. This is not an official project — just a
            fan-made tribute made with love and respect.
          </p>

          <p>
            <strong className="text-pink-300">Disclaimer:</strong> This project is{' '}
            <strong>not affiliated with, endorsed by, or claiming to prove</strong> anything regarding
            the Code of Reality community or any related project. It is an independent artistic
            interpretation created out of respect for publicly shared testimony and a desire to explore
            procedural shader art.
          </p>

          <p>
            <strong className="text-pink-300">Font license:</strong> The Code of Reality typeface is used with
            permission. See the{' '}
            <SakuraLink href="https://github.com/sakurablush/riftpane/blob/main/assets/fonts/FONT-LICENSE.md">
              FONT-LICENSE.md
            </SakuraLink>{' '}
            for details.
          </p>

          <p>
            <strong className="text-pink-300">Technical note:</strong> All visual effects are procedurally
            generated at runtime using WebGL and custom shaders. No prerecorded footage, external video
            streams, or AI models are used.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/sakurablush/riftpane"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-pink-300/70 hover:text-white transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-3.99-1.425-.135-.345-.72-1.425-1.23-1.71-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="font-bold tracking-wider">GitHub</span>
            </a>
            <span className="text-pink-500/40">·</span>
            <span className="text-pink-300/50">Fan Art · Not Official</span>
          </div>
        </div>

        <div className="pt-3 border-t border-pink-500/20 flex justify-end">
          <button
            onClick={() => setShowDisclaimer(false)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-lg transition shadow-[0_0_12px_rgba(255,42,75,0.6)] hover:shadow-[0_0_20px_rgba(255,42,75,0.9)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});