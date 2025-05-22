import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { issues } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, parseInt(id)),
    })
    return NextResponse.json({ data: issue })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    )
  }
}
