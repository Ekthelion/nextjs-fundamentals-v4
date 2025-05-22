import { db } from '@/db'
import { getSession } from './auth'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { issues, users } from '@/db/schema'
import { mockDelay } from './utils'
import { unstable_cacheTag as cacheTag } from 'next/cache'

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export const getCurrentUser = cache(async () => {
  try {
    await mockDelay(250)

    const session = await getSession()
    if (!session) return null

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
    return result[0] || null
  } catch (e) {
    console.error('Error getting user:', e)
    return null
  }
})

export const getIssues = async () => {
  'use cache'
  cacheTag('issues')

  try {
    const result = await db.query.issues.findMany({
      with: {
        user: true,
      },
      orderBy: (issues, { desc }) => [desc(issues.createdAt)],
    })
    return result
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getIssue = async (id: number) => {
  try {
    const result = await db.query.issues.findFirst({
      with: {
        user: true,
      },
      where: eq(issues.id, id),
    })
    return result
  } catch (e) {
    console.error(e)
    return null
  }
}
