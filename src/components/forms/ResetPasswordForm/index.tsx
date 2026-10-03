'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  password: string
  passwordConfirm: string
}

export const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const { resetPassword } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()
  const password = useRef('')
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!token) {
        setError('This password reset link is incomplete. Request a new link and try again.')
        return
      }

      try {
        await resetPassword({ ...data, token })
        setError('')
        setSuccess(true)
      } catch {
        setError('This reset link is invalid or has expired. Request a new link and try again.')
      }
    },
    [resetPassword, token],
  )

  if (success) {
    return (
      <div className="max-w-lg">
        <h1 className="mb-4 text-xl">Password updated</h1>
        <Message success="Your password was reset successfully." />
        <Button asChild>
          <Link href="/account">Continue to your account</Link>
        </Button>
      </div>
    )
  }

  return (
    <form className="max-w-lg" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="mb-4 text-xl">Reset password</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Enter a new password for your account.
      </p>
      <Message error={error} />
      <div className="mb-8 flex flex-col gap-8">
        <FormItem>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            {...register('password', {
              minLength: { message: 'Use at least 8 characters.', value: 8 },
              required: 'Please enter a new password.',
            })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>
        <FormItem>
          <Label htmlFor="passwordConfirm">Confirm password</Label>
          <Input
            id="passwordConfirm"
            type="password"
            {...register('passwordConfirm', {
              required: 'Please confirm your new password.',
              validate: (value) => value === password.current || 'The passwords do not match.',
            })}
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={isSubmitting || !token} type="submit">
        {isSubmitting ? 'Updating...' : 'Reset password'}
      </Button>
      {!token && (
        <p className="mt-6">
          <Link className="underline" href="/forgot-password">
            Request a new reset link
          </Link>
        </p>
      )}
    </form>
  )
}
