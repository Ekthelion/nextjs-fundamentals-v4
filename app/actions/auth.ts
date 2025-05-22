'use server'

import { z } from 'zod'
import {
  verifyPassword,
  createSession,
  createUser,
  deleteSession,
} from '@/lib/auth'
import { getUserByEmail } from '@/lib/dal'
// import { mockDelay } from '@/lib/utils'
import { redirect } from 'next/navigation'

// Define Zod schema for signin validation
const SignInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Define Zod schema for signup validation
const SignUpSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

export const signIn = async (formData: FormData): Promise<ActionResponse> => {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = SignInSchema.safeParse(data)
    if (!validatedData.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validatedData.error.flatten().fieldErrors,
      }
    }

    const user = await getUserByEmail(data.email)
    if (!user) {
      return {
        success: false,
        message: 'Authentication failed',
        errors: {
          email: ['Authentication failed'],
        },
      }
    }

    const isPasswordValid = await verifyPassword(data.password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Authentication failed',
        errors: {
          password: ['Authentication failed'],
        },
      }
    }

    const session = await createSession(user.id)
    if (!session) {
      return {
        success: false,
        message: 'Authentication failed',
        errors: {
          email: ['Authentication failed'],
        },
      }
    }

    return {
      success: true,
      message: 'Authentication successful',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Authentication failed',
      error: 'Authentication failed',
    }
  }
}

export const signUp = async (formData: FormData): Promise<ActionResponse> => {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedData = SignUpSchema.safeParse(data)
    if (!validatedData.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validatedData.error.flatten().fieldErrors,
      }
    }

    const user = await getUserByEmail(data.email)
    if (user) {
      return {
        success: false,
        message: 'Sign up failed',
        errors: {
          email: ['Sign up failed'],
        },
      }
    }

    const newUser = await createUser(data.email, data.password)
    if (!newUser) {
      return {
        success: false,
        message: 'Sign up failed',
        errors: {
          email: ['Sign up failed'],
        },
      }
    }

    const session = await createSession(newUser.id)
    if (!session) {
      return {
        success: false,
        message: 'Sign up failed',
        errors: {
          email: ['Sign up failed'],
        },
      }
    }

    return {
      success: true,
      message: 'Sign up successful',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Sign up failed',
      error: 'Sign up failed',
    }
  }
}

export const signOut = async () => {
  try {
    await deleteSession()
    return {
      success: true,
      message: 'Sign out successful',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Sign out failed',
      error: 'Sign out failed',
    }
  } finally {
    redirect('/signin')
  }
}
