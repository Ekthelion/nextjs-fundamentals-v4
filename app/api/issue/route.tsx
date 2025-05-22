import { db } from '@/db'
import { issues } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const issues = await db.query.issues.findMany({})
    return NextResponse.json({ data: issues })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const [newIssue] = await db.insert(issues).values(body).returning()

    return NextResponse.json({ data: newIssue })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}
