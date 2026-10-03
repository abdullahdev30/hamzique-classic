import { getServerSideURL } from '@/utilities/getURL'

export const buildPasswordResetURL = (token?: string): string => {
  const resetURL = new URL('/reset-password', getServerSideURL())
  resetURL.searchParams.set('token', token || '')

  return resetURL.toString()
}

export const buildPasswordResetEmailHTML = (token?: string): string => {
  const resetURL = buildPasswordResetURL(token)

  return `
    <h1>Reset your password</h1>
    <p>We received a request to reset your Hamzique Classic account password.</p>
    <p><a href="${resetURL}">Reset your password</a></p>
    <p>This link expires in one hour. If you did not request a reset, you can ignore this email.</p>
  `
}
