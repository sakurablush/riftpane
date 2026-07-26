/**
 * Shared music manager — single Audio instance for the whole app.
 * Browsers block autoplay with sound; this manager exposes explicit play/pause
 * so the init dialogs can unlock audio on the first user interaction.
 */

let audio: HTMLAudioElement | null = null;
let currentSrc: string | null = null;

export const getMusicAudio = (src: string): HTMLAudioElement => {
  if (!audio || currentSrc !== src) {
    audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.5;
    currentSrc = src;
  }
  return audio;
};

export const playMusic = (src: string): void => {
  try {
    const a = getMusicAudio(src);
    void a.play();
  } catch {
    // ignore autoplay block — user can resume via MusicButton
  }
};

export const pauseMusic = (): void => {
  if (audio) {
    audio.pause();
  }
};

export const toggleMusic = (src: string): boolean => {
  const a = getMusicAudio(src);
  if (a.paused) {
    void a.play();
    return true;
  }
  a.pause();
  return false;
};

export const isMusicPlaying = (): boolean => {
  return audio ? !audio.paused : false;
};
