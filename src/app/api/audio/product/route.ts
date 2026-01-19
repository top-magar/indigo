import { NextRequest, NextResponse } from 'next/server';
import { generateProductAudio } from '@/infrastructure/aws/polly';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, description, languageCode = 'en-US' } = body;

    if (!productName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: productName and description' },
        { status: 400 }
      );
    }

    const result = await generateProductAudio(productName, description, languageCode);

    if (!result.success || !result.audioStream) {
      return NextResponse.json(
        { error: result.error || 'Audio generation failed' },
        { status: 500 }
      );
    }

    return new NextResponse(Buffer.from(result.audioStream), {
      headers: {
        'Content-Type': result.contentType || 'audio/mpeg',
        'Content-Disposition': `inline; filename="${productName.replace(/[^a-z0-9]/gi, '-')}.mp3"`,
      },
    });
  } catch (error) {
    console.error('[API] Product audio generation failed:', error);
    return NextResponse.json(
      { error: 'Audio generation failed' },
      { status: 500 }
    );
  }
}
