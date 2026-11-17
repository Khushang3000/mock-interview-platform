import assert from 'node:assert/strict';
import test from 'node:test';
import { isMicrophoneAudioDetected } from '../lib/voice-audio.ts';

test('reports microphone input only when the audio level is above the noise threshold', () => {
    assert.equal(isMicrophoneAudioDetected(0), false);
    assert.equal(isMicrophoneAudioDetected(0.01), false);
    assert.equal(isMicrophoneAudioDetected(0.02), true);
    assert.equal(isMicrophoneAudioDetected(Number.NaN), false);
});
