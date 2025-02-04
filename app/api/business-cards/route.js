import { getAllBusinessCards } from '@/app/utils/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cards = await getAllBusinessCards();
        return NextResponse.json(cards);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch business cards' }, { status: 500 });
    }
}