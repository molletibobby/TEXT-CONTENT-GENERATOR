const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Resolve static FFmpeg and FFprobe binary paths
let ffmpegPath = 'ffmpeg';
let ffprobePath = 'ffprobe';

try {
  ffmpegPath = require('ffmpeg-static') || 'ffmpeg';
  const ffprobeStatic = require('ffprobe-static');
  if (ffprobeStatic && ffprobeStatic.path) {
    ffprobePath = ffprobeStatic.path;
  }
} catch (e) {
  logger.warn('ffmpeg-static or ffprobe-static not found, defaulting to system binaries.');
}

const MAX_VIDEO_DURATION = parseInt(process.env.MAX_VIDEO_DURATION_SECONDS || '29', 10);

/**
 * Get media file duration in seconds using ffprobe
 * @param {string} filePath - Absolute path to media file
 * @returns {Promise<number>} Duration in seconds
 */
const getMediaDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ];

    execFile(ffprobePath, args, (error, stdout, stderr) => {
      if (error) {
        logger.error(`ffprobe execution error for file ${filePath}:`, stderr || error.message);
        return resolve(0);
      }
      const duration = parseFloat(stdout.trim());
      resolve(isNaN(duration) ? 0 : duration);
    });
  });
};

/**
 * Validate Video Duration against production 29s limit
 * @param {string} filePath - Path to uploaded video
 */
const validateVideoDuration = async (filePath) => {
  const duration = await getMediaDuration(filePath);
  logger.info(`Inspecting video duration: ${duration.toFixed(2)}s (Max allowed: ${MAX_VIDEO_DURATION}s)`);

  if (duration > MAX_VIDEO_DURATION) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new AppError(`Video duration is ${duration.toFixed(1)} seconds, which exceeds the maximum limit of ${MAX_VIDEO_DURATION} seconds.`, 400);
  }

  return duration;
};

/**
 * Extract 16kHz Mono WAV Audio for Whisper engine
 * @param {string} inputPath - Path to original video/audio file
 * @param {string} outputPath - Target WAV output file path
 * @returns {Promise<string>} Output WAV path
 */
const extractAudioForWhisper = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      outputPath
    ];

    execFile(ffmpegPath, args, (error, stdout, stderr) => {
      if (error) {
        logger.error('FFmpeg audio extraction failed:', stderr || error.message);
        return reject(new AppError('Failed to process media audio track', 500));
      }
      logger.success(`Extracted clean audio to: ${outputPath}`);
      resolve(outputPath);
    });
  });
};

module.exports = {
  getMediaDuration,
  validateVideoDuration,
  extractAudioForWhisper
};
