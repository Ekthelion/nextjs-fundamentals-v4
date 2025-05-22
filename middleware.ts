import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = async (request: NextRequest) => {
  const authHeader = (await headers()).get('Authorization')
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.split('Bearer ')[1]
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
