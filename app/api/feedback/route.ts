import { NextResponse } from 'next/server'
import { createFeedback } from '@/lib/actions/general.actions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await createFeedback(body)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Feedback generation failed:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
