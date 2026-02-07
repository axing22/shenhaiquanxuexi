import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'app/[locale]/(default)/video-effects/effects.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading effects.json:', error)
    return NextResponse.json({ error: 'Failed to load effects data' }, { status: 500 })
  }
}
