import clsx from 'clsx'
import React from 'react'

/* [
          classes.message,
          className,
          error && classes.error,
          success && classes.success,
          warning && classes.warning,
          !error && !success && !warning && classes.default,
        ]
          .filter(Boolean)
          .join(' '), */

export const Message: React.FC<{
  className?: string
  error?: React.ReactNode
  message?: React.ReactNode
  success?: React.ReactNode
  warning?: React.ReactNode
}> = ({ className, error, message, success, warning }) => {
  const messageToRender = message || error || success || warning

  if (messageToRender) {
    return (
      <div
        className={clsx(
          'my-8 rounded-lg p-4',
          {
            'bg-[var(--tag-success-bg)] text-[var(--color-status-success)]': Boolean(success),
            'bg-[var(--tag-warning-bg)] text-[var(--color-status-warning)]': Boolean(warning),
            'bg-[var(--tag-error-bg)] text-[var(--color-status-error)]': Boolean(error),
            'bg-[var(--color-notification-bg)] text-[var(--color-notification-text)] ring-1 ring-[var(--color-notification-border)]':
              Boolean(message) && !error && !success && !warning,
          },
          className,
        )}
      >
        {messageToRender}
      </div>
    )
  }
  return null
}
