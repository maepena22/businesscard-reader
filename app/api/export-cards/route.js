import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
const { getDb } = require('@/app/utils/database');  // Change to require

export async function POST(request) {
    try {
        const { cardIds } = await request.json();
        
        const db = await getDb();
        const cards = await db.all(`
            SELECT 
                business_cards.*,
                employees.name as employee_name
            FROM business_cards
            LEFT JOIN employees ON business_cards.employee_id = employees.id
            WHERE business_cards.id IN (${cardIds.join(',')})
        `);
        await db.close();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Selected Business Cards');

        // Define columns with employee name
        const columns = [
            'organization',
            'department',
            'name',
            'address',
            'telephone',
            'phone',     // Add phone field
            'fax',
            'email',
            'Image',
            'website',
            'employee_name'
        ];

        // Add headers
        worksheet.addRow(columns.map(col => 
            col === 'employee_name' ? 'Uploaded By' : col.charAt(0).toUpperCase() + col.slice(1)
        ));

        // Add data with employee name
        cards.forEach(card => {
            worksheet.addRow(columns.map(col => card[col] || ''));
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=selected_business_cards.xlsx'
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}