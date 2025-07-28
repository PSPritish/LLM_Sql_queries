// Lazy loading for client-side only
let pdfjsLib = null;
let mammoth = null;
let pdfjsLoaded = false;
let mammothLoaded = false;

/**
 * Initialize PDF.js library
 */
async function initPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be initialized on client side');
  }

  if (!pdfjsLoaded) {
    try {
      const pdfjsModule = await import('pdfjs-dist');
      pdfjsLib = pdfjsModule.default || pdfjsModule;

      // Set worker source with multiple fallbacks
      if (pdfjsLib.GlobalWorkerOptions) {
        // Try different worker sources
        const workerSources = [
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
          '/pdf.worker.min.js' // Local fallback
        ];

        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
      }

      pdfjsLoaded = true;
      console.log('✅ PDF.js loaded successfully', pdfjsLib.version);
    } catch (error) {
      console.error('❌ Failed to load PDF.js:', error);
      throw new Error('Failed to initialize PDF parser');
    }
  }
  return pdfjsLib;
}

/**
 * Initialize Mammoth library
 */
async function initMammoth() {
  if (typeof window === 'undefined') {
    throw new Error('Mammoth can only be initialized on client side');
  }

  if (!mammothLoaded) {
    try {
      const mammothModule = await import('mammoth');
      mammoth = mammothModule.default || mammothModule;
      mammothLoaded = true;
      console.log('✅ Mammoth loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Mammoth:', error);
      throw new Error('Failed to initialize DOCX parser');
    }
  }
  return mammoth;
}

/**
 * Parse PDF file and extract text content
 * @param {File} file - PDF file
 * @returns {Promise<string>} Extracted text
 */
export async function parsePDF(file) {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only available on client side');
  }

  try {
    console.log(`🔍 Starting PDF parsing for: ${file.name} (${file.size} bytes)`);

    // Initialize PDF.js
    const pdfLib = await initPdfJs();

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log(`📥 File loaded into memory: ${arrayBuffer.byteLength} bytes`);

    // Load the PDF document with simplified options
    const loadingTask = pdfLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: false,
      // Remove cMap options that might cause issues
    });

    const pdf = await loadingTask.promise;
    console.log(`📄 PDF loaded successfully: ${pdf.numPages} pages`);

    let fullText = '';
    let totalChars = 0;

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extract text items and join with spaces
        let pageText = '';
        if (textContent.items && textContent.items.length > 0) {
          pageText = textContent.items
            .filter(item => item.str && typeof item.str === 'string' && item.str.trim())
            .map(item => item.str.trim())
            .join(' ');
        }

        if (pageText.trim()) {
          fullText += pageText + '\n\n';
          totalChars += pageText.length;
        }

        console.log(`📑 Page ${pageNum}: ${pageText.length} characters`);
      } catch (pageError) {
        console.warn(`⚠️ Error processing page ${pageNum}:`, pageError.message);
        // Continue with other pages instead of failing completely
      }
    }

    const result = fullText.trim();
    console.log(`✅ PDF parsing complete: ${result.length} total characters from ${pdf.numPages} pages`);

    if (!result || result.length < 10) {
      throw new Error('No readable text found in PDF. The document may be image-based, scanned, or contain only graphics.');
    }

    return result;
  } catch (error) {
    console.error('❌ PDF parsing error:', error);

    // Provide more specific error messages
    if (error.name === 'InvalidPDFException' || error.message.includes('Invalid PDF')) {
      throw new Error('Invalid or corrupted PDF file. Please check the file and try again.');
    } else if (error.name === 'PasswordException' || error.message.includes('password')) {
      throw new Error('Password-protected PDFs are not supported. Please upload an unprotected version.');
    } else if (error.message.includes('No readable text') || error.message.includes('image-based')) {
      throw error; // Re-throw our custom error
    } else if (error.message.includes('Failed to initialize')) {
      throw new Error('PDF parser initialization failed. Please refresh the page and try again.');
    } else if (error.message.includes('Network') || error.message.includes('fetch')) {
      throw new Error('Network error loading PDF parser. Please check your internet connection and try again.');
    } else {
      throw new Error(`Failed to parse PDF: ${error.message}. This might be due to an unsupported PDF format or browser limitation.`);
    }
  }
}

/**
 * Fallback PDF text extraction (very basic)
 * @param {File} file - PDF file
 * @returns {Promise<string>} Extracted text (limited)
 */
async function fallbackPDFExtraction(file) {
  console.warn('⚠️ Using fallback PDF extraction method');

  try {
    // Try to read as text (very limited success, mainly for debugging)
    const text = await file.text();

    // Look for readable text patterns in the raw PDF data
    const textMatches = text.match(/\(([^)]+)\)/g) || [];
    const extractedText = textMatches
      .map(match => match.slice(1, -1)) // Remove parentheses
      .filter(text => text.length > 2 && /[a-zA-Z]/.test(text)) // Filter meaningful text
      .join(' ');

    if (extractedText.length > 20) {
      console.log(`⚠️ Fallback extraction found ${extractedText.length} characters`);
      return extractedText;
    }

    throw new Error('Fallback extraction failed');
  } catch (error) {
    throw new Error('All PDF extraction methods failed. This may be an image-based PDF or use unsupported encoding.');
  }
}

/**
 * Parse DOCX file and extract text content
 * @param {File} file - DOCX file
 * @returns {Promise<string>} Extracted text
 */
export async function parseDocx(file) {
  if (typeof window === 'undefined') {
    throw new Error('DOCX parsing is only available on client side');
  }

  try {
    // Initialize Mammoth
    const mammothLib = await initMammoth();

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammothLib.extractRawText({ arrayBuffer });

    const text = result.value.trim();
    console.log(`✅ DOCX parsing complete: ${text.length} characters`);

    if (!text) {
      throw new Error('No readable text found in DOCX file.');
    }

    return text;
  } catch (error) {
    console.error('❌ DOCX parsing error:', error);

    if (error.message.includes('No readable text')) {
      throw error; // Re-throw our custom error
    } else {
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  }
}

/**
 * Parse DOC file (older Word format)
 * Note: This is limited support - DOC parsing in browser is complex
 * @param {File} file - DOC file
 * @returns {Promise<string>} Extracted text (limited)
 */
export async function parseDoc(file) {
  console.warn('⚠️ DOC file detected - limited support');

  try {
    // For older DOC files, we'll try to read as text (very limited success)
    const text = await file.text();

    // Basic cleanup for DOC files (this is very limited)
    const cleanedText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Remove non-printable characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('Failed to extract readable text from DOC file. Please convert to DOCX or PDF format for better results.');
    }

    console.log(`⚠️ DOC parsing (limited): ${cleanedText.length} characters`);
    return cleanedText;
  } catch (error) {
    console.error('❌ DOC parsing error:', error);
    throw new Error('Failed to parse DOC file. Please convert to DOCX or PDF format for better compatibility.');
  }
}

/**
 * Parse any supported document format
 * @param {File} file - Document file
 * @returns {Promise<{text: string, metadata: object}>} Extracted text and metadata
 */
export async function parseDocument(file) {
  if (typeof window === 'undefined') {
    throw new Error('Document parsing is only available on client side');
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  let text = '';
  let metadata = {
    filename: file.name,
    size: file.size,
    type: fileType,
    lastModified: file.lastModified
  };

  try {
    if (fileType === 'application/pdf') {
      try {
        text = await parsePDF(file);
      } catch (pdfError) {
        console.warn('⚠️ Primary PDF parsing failed, trying fallback method:', pdfError.message);

        // Try fallback method for PDFs
        try {
          text = await fallbackPDFExtraction(file);
          console.log('✅ Fallback PDF extraction succeeded');
        } catch (fallbackError) {
          console.error('❌ Both PDF extraction methods failed');
          throw pdfError; // Throw the original error
        }
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      text = await parseDocx(file);
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      text = await parseDoc(file);
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOC, or DOCX files.');
    }

    // Add text statistics to metadata
    metadata.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    metadata.characterCount = text.length;
    metadata.lineCount = text.split('\n').length;

    return { text, metadata };
  } catch (error) {
    console.error('Document parsing error:', error);
    throw error;
  }
}

/**
 * Validate if file is a supported document format
 * @param {File} file - File to validate
 * @returns {boolean} Whether file is supported
 */
export function isSupportedDocument(file) {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileName = file.name.toLowerCase();

  return allowedTypes.includes(file.type) ||
    allowedExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Get human readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Test function to debug file parsing
 * @param {File} file - File to test
 * @returns {Promise<Object>} Debug information
 */
export async function debugFileInfo(file) {
  const info = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
    isSupported: isSupportedDocument(file),
    extension: file.name.split('.').pop()?.toLowerCase(),
    sizeFormatted: formatFileSize(file.size)
  };

  console.log('🔍 File Debug Info:', info);
  return info;
}
