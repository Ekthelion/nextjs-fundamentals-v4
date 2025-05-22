import { headers, cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const GET = (request: NextRequest) => {
  return NextResponse.json({ data: 'super duper' })
}

export const POST = async (request: NextRequest) => {
  const body = await request.json()
  const headersList = await headers()
  const cookiesList = await cookies()
  console.log(headersList)
  console.log(cookiesList)
  return NextResponse.json({ data: body })
}
