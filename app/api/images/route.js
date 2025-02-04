import { readdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const files = await readdir(uploadDir);
        return NextResponse.json(files);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }
}