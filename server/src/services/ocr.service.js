const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

/**
 * Perform Optical Character Recognition (OCR) or text extraction on image/PDF files
 * @param {string} filePath - Path to local image or PDF file
 * @param {string} lang - Selected language ('eng', 'tel', 'eng+tel')
 * @returns {Promise<{text: string, confidence: number}>} Extracted text and confidence score
 */
const extractTextFromImage = async (filePath, lang = 'eng+tel') => {
  let worker = null;

  try {
    const ext = path.extname(filePath).toLowerCase();

    // Fast pure-JS PDF text parsing for digital/scanned PDFs
    if (ext === '.pdf') {
      logger.info(`Extracting text from PDF document: ${path.basename(filePath)}...`);
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      const parsedText = pdfData.text ? pdfData.text.trim() : '';
      if (parsedText.length > 10) {
        logger.success(`PDF text parsing complete! Extracted ${parsedText.length} characters.`);
        return {
          text: parsedText,
          confidence: 99,
          linesCount: pdfData.numpages || 1
        };
      }
      logger.info('PDF contains scanned bitmap data, falling back to image OCR...');
    }

    logger.info(`Starting OCR extraction on ${filePath} with language mode: ${lang}...`);

    let tesseractLang = 'eng';
    if (lang === 'tel') tesseractLang = 'tel';
    if (lang === 'eng+tel' || lang === 'tinglish') tesseractLang = 'eng+tel';

    worker = await createWorker(tesseractLang);

    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    worker = null;

    logger.success(`OCR complete! Confidence: ${data.confidence.toFixed(1)}%`);

    return {
      text: data.text ? data.text.trim() : '',
      confidence: data.confidence || 0,
      linesCount: data.lines ? data.lines.length : 0
    };
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    logger.error(`OCR / PDF text processing failed for file ${filePath}:`, error.message);
    throw new AppError(`Text extraction failed: ${error.message}`, 500);
  }
};

module.exports = {
  extractTextFromImage
};
