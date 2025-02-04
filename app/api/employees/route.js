import { NextResponse } from 'next/server';
import { getAllEmployees, addEmployee } from '@/app/utils/database';

export async function GET() {
    try {
        const employees = await getAllEmployees();
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name } = await request.json();
        const result = await addEmployee(name);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
    }
}