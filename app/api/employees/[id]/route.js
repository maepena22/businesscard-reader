import { NextResponse } from 'next/server';
import { deleteEmployee } from '@/app/utils/database';

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await deleteEmployee(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete employee error:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
}