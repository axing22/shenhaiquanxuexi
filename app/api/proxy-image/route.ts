import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    console.log('[Proxy Image] Received request for URL:', imageUrl);

    if (!imageUrl) {
      console.error('[Proxy Image] No imageUrl provided');
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (e) {
      console.error('[Proxy Image] Invalid URL format:', e);
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Use native fetch (not the intercepted one)
    console.log('[Proxy Image] Fetching image from:', imageUrl);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    console.log('[Proxy Image] Fetch response status:', response.status);

    if (!response.ok) {
      console.error('[Proxy Image] Failed to fetch image, status:', response.status);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the image data as array buffer
    const arrayBuffer = await response.arrayBuffer();
    console.log('[Proxy Image] Image size:', arrayBuffer.byteLength, 'bytes');

    // Return the image with proper headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': String(arrayBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('[Proxy Image] Error:', error);
    return NextResponse.json(
      { error: `Failed to proxy image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
