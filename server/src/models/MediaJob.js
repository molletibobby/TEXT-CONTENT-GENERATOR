const mongoose = require('mongoose');

const mediaJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for anonymous guest uploads
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'video', 'audio'],
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  targetLanguage: {
    type: String,
    enum: ['english', 'telugu', 'tinglish'],
    default: 'english'
  },
  extractedText: {
    type: String,
    default: ''
  },
  aiSummary: {
    type: String,
    default: ''
  },
  aiGeneratedContent: {
    type: String,
    default: ''
  },
  confidenceScore: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MediaJob', mediaJobSchema);
