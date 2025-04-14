/**
 * Error message processing
 * @module util/ErrorMessage
 */
import Vue from 'vue'

function playCalibrationFinishedSound() {
  const audio = new Audio('/sounds/calibration_finished.ogg');
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}

function playNeutralFinishedSound() {
  const audio = new Audio('/sounds/neutral_finished.ogg');
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}

function playRecordingSound() {
  const audio = new Audio('/sounds/recording.ogg');
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}

function playRecordingFinishedSound() {
  const audio = new Audio('/sounds/recording_finished.ogg');
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}

export {
  playCalibrationFinishedSound,
  playNeutralFinishedSound,
  playRecordingSound,
  playRecordingFinishedSound
}
