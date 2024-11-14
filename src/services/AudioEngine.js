import { Howl } from 'howler';
import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.howl = null;
    this.equalizer = null;
    this.audioContext = null;
    this.initializeEqualizer();
  }

  async initializeEqualizer() {
    try {
      await Tone.start();
      this.audioContext = Tone.getContext();
      
      // Create a chain of audio nodes
      const masterGain = new Tone.Gain().toDestination();
      
      // Create filters for different frequency bands
      const lowFilter = new Tone.Filter({
        type: "lowshelf",
        frequency: 200,
        gain: 0
      }).connect(masterGain);

      const midFilter = new Tone.Filter({
        type: "peaking",
        frequency: 1000,
        Q: 1,
        gain: 0
      }).connect(masterGain);

      const highFilter = new Tone.Filter({
        type: "highshelf",
        frequency: 3000,
        gain: 0
      }).connect(masterGain);

      // Create effects
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.2
      }).connect(lowFilter);

      const compressor = new Tone.Compressor({
        threshold: -24,
        ratio: 12,
        attack: 0.003,
        release: 0.25
      }).connect(reverb);

      this.equalizer = {
        masterGain,
        lowFilter,
        midFilter,
        highFilter,
        reverb,
        compressor,
        connect: (source) => {
          if (source) {
            source.connect(compressor);
          }
        },
      };
    } catch (error) {
      console.error('Error initializing equalizer:', error);
    }
  }

  loadTrack(track) {
    if (this.howl) {
      this.howl.unload();
    }

    this.howl = new Howl({
      src: [track.url],
      html5: true,
      format: ['mp3', 'wav'],
      onload: () => {
        if (this.howl._sounds[0] && this.howl._sounds[0]._node) {
          try {
            const audioElement = this.howl._sounds[0]._node;
            const source = this.audioContext.createMediaElementSource(audioElement);
            this.equalizer.connect(source);
          } catch (error) {
            console.error('Error connecting audio to effects chain:', error);
          }
        }
      },
    });

    return this.howl;
  }

  setEQ(low, mid, high) {
    if (this.equalizer) {
      this.equalizer.lowFilter.gain.value = low;
      this.equalizer.midFilter.gain.value = mid;
      this.equalizer.highFilter.gain.value = high;
    }
  }

  setReverb(amount) {
    if (this.equalizer && this.equalizer.reverb) {
      this.equalizer.reverb.wet.value = amount;
    }
  }

  setVolume(value) {
    if (this.equalizer && this.equalizer.masterGain) {
      this.equalizer.masterGain.gain.value = value;
    }
  }

  dispose() {
    if (this.equalizer) {
      this.equalizer.masterGain.dispose();
      this.equalizer.lowFilter.dispose();
      this.equalizer.midFilter.dispose();
      this.equalizer.highFilter.dispose();
      this.equalizer.reverb.dispose();
      this.equalizer.compressor.dispose();
    }
    if (this.howl) {
      this.howl.unload();
    }
  }
}

export default new AudioEngine(); 