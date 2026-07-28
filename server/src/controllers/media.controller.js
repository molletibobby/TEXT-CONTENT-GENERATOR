const path = require('path');
const fs = require('fs');
const MediaJob = require('../models/MediaJob');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const ffmpegService = require('../services/ffmpeg.service');
const ocrService = require('../services/ocr.service');
const whisperService = require('../services/whisper.service');
const ollamaService = require('../services/ollama.service');

/**
 * Handle Multimodal File Ingestion & Processing Pipeline
 */
exports.processMediaUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No media file uploaded. Please upload an image, PDF, video, or audio file.', 400));
    }

    const file = req.file;
    const { targetLanguage = 'english', mode = 'summary' } = req.body;
    logger.info(`Received file upload: ${file.originalname} (${file.mimetype}) - Size: ${file.size} bytes`);

    let fileType = 'image';
    if (file.mimetype.includes('pdf')) fileType = 'pdf';
    else if (file.mimetype.includes('video')) fileType = 'video';
    else if (file.mimetype.includes('audio')) fileType = 'audio';

    let extractedText = '';
    let durationSeconds = 0;
    let confidenceScore = 95;

    // STEP 1: Process according to file type
    if (fileType === 'video') {
      // Validate max 29 seconds limit
      durationSeconds = await ffmpegService.validateVideoDuration(file.path);

      // Extract 16kHz audio for Whisper
      const extractedWavPath = path.join(__dirname, '../../processed', `${path.basename(file.path)}.wav`);
      await ffmpegService.extractAudioForWhisper(file.path, extractedWavPath);

      // Transcribe Audio
      const transcription = await whisperService.transcribeAudio(extractedWavPath, targetLanguage === 'telugu' ? 'te' : 'en');
      extractedText = transcription.transcript;
    } else if (fileType === 'audio') {
      durationSeconds = await ffmpegService.getMediaDuration(file.path);
      const transcription = await whisperService.transcribeAudio(file.path, targetLanguage === 'telugu' ? 'te' : 'en');
      extractedText = transcription.transcript;
    } else if (fileType === 'image' || fileType === 'pdf') {
      const ocrResult = await ocrService.extractTextFromImage(file.path, targetLanguage === 'telugu' ? 'tel' : 'eng+tel');
      extractedText = ocrResult.text;
      confidenceScore = ocrResult.confidence;
    }

    // STEP 2: Generate AI Summary or Translation (English / Telugu / Tinglish)
    let aiMode = mode;
    if (targetLanguage === 'telugu') aiMode = 'translate_telugu';
    if (targetLanguage === 'tinglish') aiMode = 'translate_tinglish';

    const aiSummary = await ollamaService.generateAIContent(extractedText || 'No text detected', aiMode);

    // STEP 3: Save Job to MongoDB History if connected
    let mediaJobRecord = null;
    try {
      mediaJobRecord = await MediaJob.create({
        fileType,
        originalName: file.originalname,
        mimeType: file.mimetype,
        filePath: file.path,
        fileSize: file.size,
        durationSeconds,
        targetLanguage,
        extractedText: extractedText || 'No text extracted.',
        aiSummary: aiSummary || 'Summary generation completed.',
        confidenceScore
      });
    } catch (dbErr) {
      logger.warn(`Database record creation skipped (offline demo mode): ${dbErr.message}`);
    }

    res.status(200).json({
      status: 'success',
      data: {
        jobId: mediaJobRecord ? mediaJobRecord._id : Date.now().toString(),
        fileType,
        originalName: file.originalname,
        durationSeconds,
        targetLanguage,
        extractedText: extractedText || 'No readable text extracted from document.',
        aiSummary,
        confidenceScore
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Perform Custom AI Content Generation
 */
exports.generateCustomContent = async (req, res, next) => {
  try {
    const { contextText, prompt, language = 'english' } = req.body;

    if (!contextText) {
      return next(new AppError('Context text is required for AI content generation.', 400));
    }

    let aiMode = 'generate';
    if (language === 'telugu') aiMode = 'translate_telugu';
    if (language === 'tinglish') aiMode = 'translate_tinglish';

    const generatedContent = await ollamaService.generateAIContent(contextText, aiMode, prompt);

    res.status(200).json({
      status: 'success',
      data: {
        language,
        generatedContent
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch Upload History
 */
exports.getHistory = async (req, res, next) => {
  try {
    const jobs = await MediaJob.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs }
    });
  } catch (err) {
    res.status(200).json({
      status: 'success',
      results: 0,
      data: { jobs: [] }
    });
  }
};

/**
 * Delete History Item
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await MediaJob.findByIdAndDelete(id);
    if (job && job.filePath && fs.existsSync(job.filePath)) {
      fs.unlinkSync(job.filePath);
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};
