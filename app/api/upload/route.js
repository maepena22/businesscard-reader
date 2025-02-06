import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { processUploadedImages } from '@/app/utils/businessCardProcessor';
import logger from '@/app/utils/logger';  

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request) {
    try {
        logger.api('Starting file upload process');
        const formData = await request.formData();
        const files = formData.getAll('files');
        const employeeId = formData.get('employeeId');

        logger.api(`Processing ${files.length} files for employee ID: ${employeeId}`);

        const uploadedFiles = [];
        for (const file of files) {
            try {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                
                const uploadDir = './public/uploads';
                const filePath = `${uploadDir}/${file.name}`;
                await writeFile(filePath, buffer);
                
                uploadedFiles.push({
                    originalname: file.name,
                    path: filePath,
                    employeeId
                });
                logger.api(`Successfully uploaded file: ${file.name}`);
            } catch (error) {
                logger.api(`Failed to process file: ${file.name}`, error);
            }
        }

        const result = await processUploadedImages(
            uploadedFiles,
            process.env.GOOGLE_API_KEY,
            process.env.OPENAI_API_KEY,
            employeeId
        );

        logger.api('Upload process completed successfully');
        return NextResponse.json(result);
    } catch (error) {
        logger.api('Upload process failed', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}