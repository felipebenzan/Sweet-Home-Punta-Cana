import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Force serve the official-favicon.png whenever /favicon.ico is requested
        const filePath = join(process.cwd(), 'public', 'official-favicon.png');
        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse(null, { status: 404 });
    }
}
