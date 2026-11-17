export const isMicrophoneAudioDetected = (level: number) =>
    Number.isFinite(level) && level > 0.01;
