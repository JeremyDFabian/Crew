import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import styles from './Combobox.module.css'

type Props = {
  label: string
  placeholder: string
  query: string
  onQueryChange: (q: string) => void
  options: string[]
  onSelect: (value: string) => void
  emptyHint?: string
  onEmptyAccept?: (value: string) => void
  autoFocus?: boolean
}

export function Combobox({
  label,
  placeholder,
  query,
  onQueryChange,
  options,
  onSelect,
  emptyHint,
  onEmptyAccept,
  autoFocus,
}: Props) {
  const inputId = useId()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [highlight, setHighlight] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    setHighlight(0)
  }, [query, options.length])

  const isEmpty = query.trim() !== '' && options.length === 0
  const showEmptyFallback = isEmpty && !!onEmptyAccept

  function commit(value: string) {
    onSelect(value)
    setOpen(false)
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (options[highlight]) {
        commit(options[highlight])
      } else if (showEmptyFallback && query.trim()) {
        onEmptyAccept!(query.trim())
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={styles.root}>
      <label htmlFor={inputId} className={styles.srOnly}>
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[highlight] ? `${listId}-${highlight}` : undefined
        }
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120)
        }}
        onKeyDown={onKey}
        autoComplete="off"
        spellCheck={false}
      />
      {open && options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className={styles.list}
        >
          {options.map((opt, i) => (
            <li
              key={opt}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlight}
              className={`${styles.option} ${
                i === highlight ? styles.optionActive : ''
              }`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                commit(opt)
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {open && showEmptyFallback && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{emptyHint}</p>
          <button
            type="button"
            className={styles.emptyAction}
            onMouseDown={(e) => {
              e.preventDefault()
              onEmptyAccept!(query.trim())
              setOpen(false)
            }}
          >
            Use “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  )
}
