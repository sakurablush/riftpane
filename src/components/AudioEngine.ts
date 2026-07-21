// Immersion Synthesizer for Laser Speckle Simulator using Web Audio API
import { SimulationConfig, WAVELENGTHS } from '../types';

class LaserAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  
  // Laser speckle crackle / hiss generator
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  
  // Glitch spark sound
  private glitchGain: GainNode | null = null;

  private isEnabled = false;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      // Setup master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Setup Carrier Hum (Coherent Beam Frequency)
      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = 'sawtooth'; // Gives a richer harmonic spectrum
      this.humOsc.frequency.setValueAtTime(60, this.ctx.currentTime); // Deep hum

      // Low pass filter to make the hum warm and heavy
      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      humFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      this.humOsc.connect(humFilter);
      humFilter.connect(this.humGain);
      this.humGain.connect(this.masterGain);
      this.humOsc.start();

      // 2. Setup Speckle Hiss (Granular static)
      // Since AudioWorklet requires external files, we use a custom ScriptProcessorNode as a fallback
      // which is highly compatible and simple for self-contained apps.
      const bufferSize = 4096;
      this.noiseNode = this.ctx.createScriptProcessor(bufferSize, 1, 1);
      
      let lastOut = 0.0;
      this.noiseNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Simple brown/pink-ish filter for crackly, soft texture
          lastOut = 0.95 * lastOut + 0.05 * white;
          
          // Add micro static crackles
          const crackle = Math.random() > 0.992 ? (Math.random() * 0.3) : 0;
          output[i] = (lastOut * 0.4 + crackle) * 0.25;
        }
      };

      this.noiseFilter = this.ctx.createBiquadFilter();
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      this.noiseFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      this.noiseNode.connect(this.noiseFilter);
      this.noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);

      // 3. Glitch Synthesizer Node (Quick laser discharge sounds)
      this.glitchGain = this.ctx.createGain();
      this.glitchGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      
      const glitchOsc = this.ctx.createOscillator();
      glitchOsc.type = 'triangle';
      glitchOsc.frequency.setValueAtTime(400, this.ctx.currentTime);

      const glitchFilter = this.ctx.createBiquadFilter();
      glitchFilter.type = 'peaking';
      glitchFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      glitchFilter.Q.setValueAtTime(5.0, this.ctx.currentTime);

      glitchOsc.connect(glitchFilter);
      glitchFilter.connect(this.glitchGain);
      this.glitchGain.connect(this.masterGain);
      glitchOsc.start();

      this.isEnabled = true;
    } catch (err) {
      console.error('Failed to initialize Web Audio:', err);
    }
  }

  public async resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public update(config: SimulationConfig, isGlitching: boolean) {
    if (!this.ctx || !this.isEnabled) return;

    const wl = WAVELENGTHS[config.wavelength] || WAVELENGTHS[650];
    const now = this.ctx.currentTime;

    // Scale audio volumes based on overall config
    const targetVolume = config.audioVolume ? config.audioVolumeLevel : 0;
    
    // Smooth master gain transitions
    this.masterGain?.gain.setTargetAtTime(targetVolume * 0.4, now, 0.15);

    if (this.humOsc && this.humGain && this.noiseFilter && this.noiseGain) {
      // Wavelength dictates pitch (shorter wavelength = higher frequency)
      // 650nm (Red) => ~55Hz, 405nm (Violet) => ~120Hz
      const baseFreq = 55 * wl.frequencyFactor;
      
      // Modulate frequency slightly with laser drift (creates organic movement)
      const driftMod = Math.sin(now * 1.5) * 1.5;
      this.humOsc.frequency.setTargetAtTime(baseFreq + driftMod, now, 0.2);

      // Pulsing presets vs continuous hum
      if (config.audioType === 'pulsing') {
        const pulse = 0.5 + 0.5 * Math.sin(now * 4);
        this.humGain.gain.setTargetAtTime(0.3 * pulse * config.intensity, now, 0.05);
      } else if (config.audioType === 'ambient') {
        // Soft wave hum
        const wave = 0.7 + 0.3 * Math.sin(now * 0.8);
        this.humGain.gain.setTargetAtTime(0.15 * wave * config.intensity, now, 0.2);
      } else {
        // Coherent, focused beam hum
        this.humGain.gain.setTargetAtTime(0.35 * config.intensity, now, 0.1);
      }

      // Filter frequency changes based on speckle speed and scale
      const filterFreq = 1000 + (3000 * (config.speckleSpeed / 2)) * (wl.grainSize / 3);
      this.noiseFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);
      
      // Noise gain scales with speckle contrast
      const noiseVol = 0.05 + 0.25 * config.speckleContrast * (config.speckleSpeed / 2) * config.intensity;
      this.noiseGain.gain.setTargetAtTime(noiseVol, now, 0.2);
    }

    // Trigger crackling discharge during glitches
    if (this.glitchGain && isGlitching) {
      // Rapid high-pitched click/sweep
      this.glitchGain.gain.setValueAtTime(0.35 * config.intensity, now);
      this.glitchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    }
  }

  public shutdown() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.isEnabled = false;
    }
  }
}

// Export singleton instance
export const audio = new LaserAudioEngine();
