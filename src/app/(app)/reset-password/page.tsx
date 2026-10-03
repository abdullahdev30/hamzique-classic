import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default function ResetPasswordPage() {
  return (
    <div className="container py-16">
      <Suspense fallback={<p>Loading password reset...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Set a new password for your Hamzique Classic account.',
  openGraph: mergeOpenGraph({
    title: 'Reset Password',
    url: '/reset-password',
  }),
  title: 'Reset Password',
}
