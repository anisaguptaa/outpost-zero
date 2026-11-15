let audioContext;

export function playUiTone(kind = 'tap') {
  if (typeof window === 'undefined') return;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;

  try {
    audioContext ||= new Context();
    if (audioContext.state === 'suspended') void audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const startFrequency = kind === 'confirm' ? 620 : 390;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'confirm' ? 880 : 510, now + 0.075);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.035, now + 0.012);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch {
    // Audio is an optional enhancement; the mission must work if the browser blocks it.
  }
}
