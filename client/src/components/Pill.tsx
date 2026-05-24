import styles from './Pill.module.css'

export function LivePill() {
  return (
    <span className={styles.live}>
      <span className={styles.dot} aria-hidden="true" />
      <span>Live</span>
    </span>
  )
}

export function YoureInPill() {
  return (
    <span className={styles.youreIn}>
      <CheckIcon />
      <span>You&rsquo;re in</span>
    </span>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
