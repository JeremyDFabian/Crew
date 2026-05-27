import { useEffect, useRef } from 'react'
import styles from './Toast.module.css'

type Props = {
  message: string
  actionLabel: string
  onAction: () => void
  onDismiss: () => void
  durationMs?: number
}

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 5000,
}: Props) {
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    const id = window.setTimeout(() => dismissRef.current(), durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs])

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.action}
        onClick={() => {
          onAction()
          onDismiss()
        }}
      >
        {actionLabel}
      </button>
    </div>
  )
}
