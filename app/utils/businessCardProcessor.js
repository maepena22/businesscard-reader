const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ExcelJS = require('exceljs');
const OpenAI = require('openai');
const { saveBusinessCard } = require('./database');
import logger from './logger';  // Add logger import

async function uploadImageAndGetText(imagePath, apiKey) {
    try {
        logger.thirdParty(`Starting Google Vision API request for ${imagePath}`);
        
        const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
        const imageContent = fs.readFileSync(imagePath, { encoding: 'base64' });
        
        const payload = {
            requests: [{
                image: {
                    content: imageContent
                },
                features: [{
                    type: "TEXT_DETECTION"
                }]
            }]
        };

        const response = await axios.post(url, payload);
        
        if (response.status !== 200) {
            logger.thirdParty(`Google Vision API error: Status ${response.status}`, response.data);
            throw new Error(`Error: ${response.status}, ${response.data}`);
        }

        logger.thirdParty(`Successfully processed image ${imagePath}`);
        return response.data.responses[0].textAnnotations[0].description;
    } catch (error) {
        logger.thirdParty(`Google Vision API request failed for ${imagePath}`, error);
        throw error;
    }
}

async function structureBusinessCardDataUsingChatGPT(text, openaiApiKey) {
    const configuration = new OpenAI.Configuration({
        apiKey: openaiApiKey
    });
    const openai = new OpenAI.OpenAIApi(configuration);

    const prompt = `
    Extract the following business card information from the given text and return the result as a structured JSON object. 
    For phone numbers: if there are multiple numbers, put office/main number in "telephone" and mobile/cell in "phone".
    If there's only one number, put it in "telephone". Do not return repeating information, if there are 2 versions kanji and english letter, prioritize kanji.
    Do not include anything else, only the JSON object.

    Text:
    ${text}

    Structured JSON:
    {
        "organization": "Company Name",
        "department": "Department Name",
        "name": "Full Name",
        "address": "Postal Address",
        "telephone": "Office/Main Phone Number",
        "phone": "Mobile/Cell Phone Number",
        "fax": "Fax Number",
        "email": "Email Address",
        "website": "Website URL"
    }`;

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0,
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error(`Error while processing the request: ${error}`);
        return "Error processing the image.";
    }
}

async function processImagesInFolder(folderPath, googleApiKey, openaiApiKey, outputFile) {
    const data = [];

    const files = fs.readdirSync(folderPath);
    
    for (const filename of files) {
        const imagePath = path.join(folderPath, filename);
        const ext = path.extname(filename).toLowerCase();

        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            console.log(`Processing ${filename}...`);

            try {
                const extractedText = await uploadImageAndGetText(imagePath, googleApiKey);
                if (!extractedText) {
                    console.log(`No text detected in ${filename}`);
                    continue;
                }

                console.log(`Extracted Text from ${filename}: ${extractedText}`);

                const structuredData = await structureBusinessCardDataUsingChatGPT(extractedText, openaiApiKey);

                try {
                    const jsonData = JSON.parse(structuredData);
                    jsonData.Image = filename;
                    data.push(jsonData);
                } catch (error) {
                    console.log(`Failed to parse JSON for ${filename}`);
                    data.push({ Image: filename, Error: "Failed to parse JSON" });
                }
            } catch (error) {
                console.error(`Error processing ${filename}: ${error.message}`);
            }
        }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Business Cards');

    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);
        data.forEach(row => {
            worksheet.addRow(Object.values(row));
        });
    }

    await workbook.xlsx.writeFile(outputFile);
    console.log(`Excel file saved to: ${outputFile}`);
}

async function processUploadedImages(files, googleApiKey, openaiApiKey, employeeId) {
    const data = [];
    
    console.log(`Starting to process ${files.length} uploaded images`); // Temporary fallback logging
    
    for (const file of files) {
        console.log(`Processing ${file.originalname}`); // Temporary fallback logging
        try {
            const extractedText = await uploadImageAndGetText(file.path, googleApiKey);
            if (!extractedText) {
                console.log(`No text detected in ${file.originalname}`);
                continue;
            }

            const structuredData = await structureBusinessCardDataUsingChatGPT(extractedText, openaiApiKey);

            try {
                const jsonData = JSON.parse(structuredData);
                jsonData.Image = file.originalname;
                jsonData.employee_id = employeeId;
                await saveBusinessCard(jsonData);
                data.push(jsonData);
                console.log(`Successfully processed ${file.originalname}`); // Temporary fallback logging
            } catch (error) {
                console.error(`Invalid JSON format for ${file.originalname}: ${error.message}`);
            }
        } catch (error) {
            console.error(`Error processing ${file.originalname}: ${error.message}`);
        }
    }

    return { success: true, count: data.length };
}

export { uploadImageAndGetText, structureBusinessCardDataUsingChatGPT, processUploadedImages };