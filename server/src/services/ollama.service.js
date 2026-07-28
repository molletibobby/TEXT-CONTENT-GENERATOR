const axios = require('axios');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.DEFAULT_LLM_MODEL || 'llama3';

/**
 * Check if local Ollama engine is running
 */
const checkOllamaHealth = async () => {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 3000 });
    return {
      online: true,
      models: res.data?.models?.map(m => m.name) || []
    };
  } catch (error) {
    return { online: false, models: [] };
  }
};

/**
 * Generate AI Summary or Multilingual Content using local Ollama LLM
 * @param {string} promptText - Input context or extracted text
 * @param {string} mode - 'summary' | 'generate' | 'translate_telugu' | 'translate_tinglish'
 * @param {string} customPrompt - Additional instructions
 * @returns {Promise<string>} Generated AI output
 */
const generateAIContent = async (promptText, mode = 'summary', customPrompt = '') => {
  try {
    const health = await checkOllamaHealth();

    let systemInstruction = 'You are an expert AI assistant specializing in text processing, summarization, and multilingual content creation in English, Telugu (తెలుగు), and Tinglish (Telugu in English script).';
    
    let fullPrompt = '';
    if (mode === 'summary') {
      fullPrompt = `Summarize the following text cleanly with 3-5 key bullet points, followed by a 2-sentence executive summary:\n\n${promptText}`;
    } else if (mode === 'translate_telugu') {
      fullPrompt = `Translate and explain the main ideas of the following text into fluent Telugu (తెలుగు script):\n\n${promptText}`;
    } else if (mode === 'translate_tinglish') {
      fullPrompt = `Summarize and rewrite the following text in natural Tinglish (Telugu spoken language written in Roman/English alphabet, common in chat messages):\n\n${promptText}`;
    } else if (mode === 'generate') {
      fullPrompt = `Using the following context, ${customPrompt || 'generate a well-structured social media post and blog overview'}:\n\n${promptText}`;
    } else {
      fullPrompt = `${customPrompt}\n\nContext:\n${promptText}`;
    }

    if (health.online) {
      logger.info(`Invoking local Ollama LLM (${DEFAULT_MODEL}) for mode: ${mode}...`);
      const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model: DEFAULT_MODEL,
        prompt: `${systemInstruction}\n\n${fullPrompt}`,
        stream: false
      }, { timeout: 45000 });

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }
    }

    // Offline / Fallback Heuristic Generator if Ollama LLM is currently booting or pulling model
    logger.warn('Ollama local LLM service offline or not responding. Using fallback heuristic engine.');
    return generateFallbackSummary(promptText, mode);
  } catch (error) {
    logger.error('Ollama AI service error:', error.message);
    return generateFallbackSummary(promptText, mode);
  }
};

/**
 * Fallback Text Summarizer when LLM server is starting up
 */
const generateFallbackSummary = (text, mode) => {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
  const firstSentences = sentences.slice(0, 3).join(' ');

  if (mode === 'translate_telugu') {
    return `[అందించిన పాఠ్యం సారాంశం (Offline Summary)]:\n${text.substring(0, 300)}...\n\n(గమనిక: పూర్తి లైవ్ Ollama AI మోడల్ ప్రస్తుతం లోడ్ అవుతోంది.)`;
  }
  if (mode === 'translate_tinglish') {
    return `[Tinglish Summary (Offline)]:\nEe content loni mukhya vishayalu:\n- ${sentences[0] || text.substring(0, 100)}\n- ${sentences[1] || 'Ingestion completed successfully.'}\n\n(Note: Live Ollama LLM model standard response pending start.)`;
  }

  return `### Key Takeaways (Offline Engine)\n- ${sentences[0] || text.substring(0, 100)}\n- ${sentences[1] || 'Processed multimodal stream.'}\n\n### Summary Overview\n${firstSentences || text}`;
};

module.exports = {
  checkOllamaHealth,
  generateAIContent
};
