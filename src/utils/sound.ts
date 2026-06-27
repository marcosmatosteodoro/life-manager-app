// Sons curtos sintetizados via Web Audio (sem arquivos). Distintos para foco e
// pausa. Browsers exigem um gesto do usuário antes de tocar — ver unlockAudio.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Libera o áudio. Chame a partir de um gesto do usuário (ex.: clique). */
export function unlockAudio(): void {
  const audio = getCtx();
  if (audio && audio.state === 'suspended') void audio.resume();
}

/**
 * Toca um bipe curto de dois tons:
 * - 'focus' = ascendente (volta ao trabalho);
 * - 'break' = descendente (hora de pausar).
 */
export function playBeep(type: 'focus' | 'break'): void {
  const audio = getCtx();
  if (!audio) return;
  void audio.resume();

  const freqs = type === 'focus' ? [660, 880] : [523, 392];
  freqs.forEach((freq, i) => {
    const startAt = audio.currentTime + i * 0.18;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // Envelope curto para não estalar.
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(startAt);
    osc.stop(startAt + 0.18);
  });
}
