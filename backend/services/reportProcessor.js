const fs = require('fs').promises;
const path = require('path');
const tesseract = require('node-tesseract-ocr');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const { GoogleGenerativeAI } = require("@google/generative-ai");

class ReportProcessor {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // AWS Textract setup (optional - requires AWS credentials)
        this.textract = new AWS.Textract({
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
    }

    async processReport(filePath, fileType, fileName) {
        try {
            let extractedText = '';
            
            switch (fileType) {
                case 'pdf':
                    extractedText = await this.processPDF(filePath);
                    break;
                case 'image':
                    extractedText = await this.processImage(filePath);
                    break;
                case 'text':
                    extractedText = await this.processText(filePath);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            // Clean and normalize text
            const cleanedText = this.cleanText(extractedText);
            
            // Parse with AI for medical insights
            const medicalSummary = await this.parseWithAI(cleanedText, fileName);
            
            // Extract structured data
            const structuredData = await this.extractStructuredData(cleanedText);
            
            return {
                success: true,
                fileName,
                extractedText: cleanedText,
                medicalSummary,
                structuredData,
                processedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Report processing error:', error);
            return {
                success: false,
                error: error.message,
                fileName
            };
        }
    }

    async processPDF(filePath) {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }

    async processImage(filePath) {
        try {
            // First, try with AWS Textract if configured
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                return await this.processWithTextract(filePath);
            }
            
            // Fallback to Tesseract OCR
            return await this.processWithTesseract(filePath);
        } catch (error) {
            console.error('Image processing error:', error);
            // Fallback to Tesseract if Textract fails
            return await this.processWithTesseract(filePath);
        }
    }

    async processWithTextract(filePath) {
        const imageBytes = await fs.readFile(filePath);
        
        const params = {
            Document: {
                Bytes: imageBytes
            }
        };

        const result = await this.textract.detectDocumentText(params).promise();
        return result.Blocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text)
            .join('\n');
    }

    async processWithTesseract(filePath) {
        // Preprocess image for better OCR
        const processedPath = await this.preprocessImage(filePath);
        
        const config = {
            lang: "eng",
            oem: 1,
            psm: 3,
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()-[]{}"/% '
        };
        
        const text = await tesseract.recognize(processedPath, config);
        
        // Clean up processed file
        if (processedPath !== filePath) {
            await fs.unlink(processedPath);
        }
        
        return text;
    }

    async preprocessImage(filePath) {
        const processedPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');
        
        await sharp(filePath)
            .greyscale()
            .normalize()
            .sharpen()
            .png()
            .toFile(processedPath);
        
        return processedPath;
    }

    async processText(filePath) {
        return await fs.readFile(filePath, 'utf8');
    }

    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E\n]/g, '')
            .trim();
    }

    async parseWithAI(text, fileName) {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const prompt = `
                Analyze this medical report and provide a comprehensive summary in JSON format:
                
                Report: ${text}
                
                Please extract and organize the following information:
                1. Patient demographics (age, gender, etc.)
                2. Key symptoms and complaints
                3. Laboratory results with normal ranges
                4. Imaging findings
                5. Diagnoses and conditions
                6. Medications and treatments
                7. Risk factors for pancreatic cancer
                8. Recommendations and follow-up
                9. Plain language explanation for patients
                10. Any red flags or urgent findings
                
                Format the response as valid JSON with these sections:
                {
                    "patientInfo": {},
                    "symptoms": [],
                    "labResults": [],
                    "imagingFindings": [],
                    "diagnoses": [],
                    "medications": [],
                    "riskFactors": [],
                    "recommendations": [],
                    "plainLanguageExplanation": "",
                    "urgentFindings": [],
                    "keyMetrics": {}
                }
            `;
            
            const result = await model.generateContent(prompt);
            const response = result.response;
            
            try {
                return JSON.parse(response.text());
            } catch (parseError) {
                // If JSON parsing fails, return structured text
                return {
                    summary: response.text(),
                    error: "Failed to parse as JSON, returning raw summary"
                };
            }
        } catch (error) {
            console.error('AI parsing error:', error);
            return {
                error: "Failed to process with AI",
                summary: "Please review the extracted text manually."
            };
        }
    }

    async extractStructuredData(text) {
        // Extract common medical values using regex patterns
        const patterns = {
            bloodPressure: /(?:BP|Blood Pressure)[\s:]*(\d{2,3}\/\d{2,3})/gi,
            heartRate: /(?:HR|Heart Rate|Pulse)[\s:]*(\d{1,3})\s*(?:bpm)?/gi,
            temperature: /(?:Temp|Temperature)[\s:]*(\d{1,3}\.?\d?)\s*°?[FC]?/gi,
            weight: /(?:Weight|Wt)[\s:]*(\d{1,3}\.?\d?)\s*(?:kg|lbs?|pounds?)?/gi,
            height: /(?:Height|Ht)[\s:]*(\d{1,3}\.?\d?)\s*(?:cm|ft|inches?|in)?/gi,
            glucose: /(?:Glucose|Blood Sugar)[\s:]*(\d{1,3})\s*(?:mg\/dL)?/gi,
            cholesterol: /(?:Cholesterol|Chol)[\s:]*(\d{1,3})\s*(?:mg\/dL)?/gi,
            dates: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/g
        };

        const extractedData = {};
        
        for (const [key, pattern] of Object.entries(patterns)) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                extractedData[key] = matches.map(match => ({
                    value: match[1],
                    context: match[0]
                }));
            }
        }

        return extractedData;
    }
}

module.exports = ReportProcessor;