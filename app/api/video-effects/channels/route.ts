import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'app/[locale]/(default)/video-effects/effects-channels.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading effects-channels.json:', error)
    return NextResponse.json({ error: 'Failed to load channels data' }, { status: 500 })
  }
}
