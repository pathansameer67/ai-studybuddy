import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text from a PDF file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const parsePDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `[Page ${i}]\n${pageText}\n\n`;
        }

        return fullText.trim();
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to read PDF. Make sure it's not password protected.");
    }
};

/**
 * Extracts text from a .txt or .md file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const parseTextFile = async (file) => {
    try {
        return await file.text();
    } catch (error) {
        console.error("Text Parsing Error:", error);
        throw new Error("Failed to read the text file.");
    }
};

/**
 * Converts an image file to a base64 string for AI vision models.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};
