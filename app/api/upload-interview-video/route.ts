import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

async function saveFile(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.name);
    fs.writeFileSync(filePath, buffer);
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        const fileUrl = await saveFile(file);
        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}