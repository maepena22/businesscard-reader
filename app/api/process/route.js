import { processUploadedImages } from '@/app/utils/businessCardProcessor';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        const uploadedFiles = [];
        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const uploadDir = join(process.cwd(), 'public', 'uploads');
            const filePath = join(uploadDir, file.name);
            await writeFile(filePath, buffer);
            
            uploadedFiles.push({
                originalname: file.name,
                path: filePath
            });
        }

        const excelBuffer = await processUploadedImages(
            uploadedFiles,
            process.env.GOOGLE_API_KEY,
            process.env.OPENAI_API_KEY
        );

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=business_cards.xlsx'
            }
        });
    } catch (error) {
        console.error('Processing failed:', error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}