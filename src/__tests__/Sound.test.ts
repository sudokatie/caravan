/**
 * @jest-environment jsdom
 */
import { Sound } from '../game/Sound';

// Mock AudioContext
const mockOscillator = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  type: 'sine',
  frequency: {
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockGain = {
  connect: jest.fn(),
  gain: {
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockFilter = {
  connect: jest.fn(),
  type: 'lowpass',
  frequency: {
    value: 0,
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockBufferSource = {
  connect: jest.fn(),
  start: jest.fn(),
  buffer: null,
};

const mockBuffer = {
  getChannelData: jest.fn(() => new Float32Array(4410)),
};

const mockAudioContext = {
  createOscillator: jest.fn(() => ({ ...mockOscillator })),
  createGain: jest.fn(() => ({ ...mockGain, gain: { ...mockGain.gain } })),
  createBiquadFilter: jest.fn(() => ({ ...mockFilter, frequency: { ...mockFilter.frequency } })),
  createBufferSource: jest.fn(() => ({ ...mockBufferSource })),
  createBuffer: jest.fn(() => mockBuffer),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn(),
  sampleRate: 44100,
};

describe('Sound', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    Sound.resetContext();
    Sound.setEnabled(true);
    Sound.setVolume(0.3);
    
    // Mock AudioContext on window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as { AudioContext: () => typeof mockAudioContext }).AudioContext = jest.fn(() => mockAudioContext) as unknown as () => typeof mockAudioContext;
  });

  describe('initialization', () => {
    it('should be a singleton', () => {
      const instance1 = Sound;
      const instance2 = Sound;
      expect(instance1).toBe(instance2);
    });

    it('should start enabled', () => {
      expect(Sound.isEnabled()).toBe(true);
    });

    it('should have default volume', () => {
      expect(Sound.getVolume()).toBe(0.3);
    });
  });

  describe('enable/disable', () => {
    it('should toggle enabled state', () => {
      Sound.setEnabled(false);
      expect(Sound.isEnabled()).toBe(false);
      Sound.setEnabled(true);
      expect(Sound.isEnabled()).toBe(true);
    });

    it('should not play sounds when disabled', () => {
      Sound.setEnabled(false);
      Sound.play('travel');
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('volume', () => {
    it('should set volume', () => {
      Sound.setVolume(0.5);
      expect(Sound.getVolume()).toBe(0.5);
    });

    it('should clamp volume to 0-1', () => {
      Sound.setVolume(-0.5);
      expect(Sound.getVolume()).toBe(0);
      Sound.setVolume(1.5);
      expect(Sound.getVolume()).toBe(1);
    });
  });

  describe('sound playback', () => {
    it('should play travel sound', () => {
      Sound.play('travel');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should play river sound', () => {
      Sound.play('river');
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
      expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    });

    it('should play hunt sound', () => {
      Sound.play('hunt');
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    it('should play huntSuccess sound', () => {
      Sound.play('huntSuccess');
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should play buy sound', () => {
      Sound.play('buy');
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    });

    it('should play sell sound', () => {
      Sound.play('sell');
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should play event sound', () => {
      Sound.play('event');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('should play death sound', () => {
      Sound.play('death');
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should play victory sound', () => {
      Sound.play('victory');
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(5);
    });

    it('should play gameOver sound', () => {
      Sound.play('gameOver');
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
    });
  });

  describe('context handling', () => {
    it('should resume suspended context', () => {
      mockAudioContext.state = 'suspended';
      Sound.play('travel');
      expect(mockAudioContext.resume).toHaveBeenCalled();
      mockAudioContext.state = 'running';
    });

    it('should handle missing AudioContext gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as unknown as Record<string, unknown>).AudioContext = undefined;
      Sound.resetContext();
      expect(() => Sound.play('travel')).not.toThrow();
    });
  });
});
