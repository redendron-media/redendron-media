'use client'

import { useId } from 'react'

import { cn } from '@/lib/utils'

/**
 * Form primitives.
 *
 * Underlined rather than boxed: on an off-white ground with a particle field
 * behind it, a grid of filled input boxes reads as a different website. The
 * rule thickens and turns accent on focus, which is the same gesture the nav
 * underline and the accordion use.
 *
 * Every control gets a real <label> and wires aria-invalid / aria-describedby,
 * so errors are announced rather than only coloured.
 */

const baseField =
  'w-full border-b hairline-2 bg-transparent pb-3 pt-2 text-lead outline-none transition-colors ' +
  'placeholder:text-faint focus:border-accent aria-[invalid=true]:border-accent'

function Shell({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-small text-muted">
        {label}
      </label>
      <div className="mt-3">{children}</div>
      {hint && !error && <p className="mt-2 text-small text-faint">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-2 text-small text-accent">
          {error}
        </p>
      )}
    </div>
  )
}

type FieldProps = {
  label: string
  hint?: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function Field({ label, hint, error, className, ...props }: FieldProps) {
  const id = useId()
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={id}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseField, className)}
        {...props}
      />
    </Shell>
  )
}

type AreaProps = {
  label: string
  hint?: string
  error?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ label, hint, error, className, ...props }: AreaProps) {
  const id = useId()
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={id}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseField, 'resize-none leading-snug', className)}
        {...props}
      />
    </Shell>
  )
}

/**
 * Chip group. Renders real radios or checkboxes and styles their labels, so it
 * stays keyboard navigable and screen-reader legible - a div with onClick
 * would not be either.
 */
export function ChipGroup({
  legend,
  name,
  options,
  value,
  multiple,
  error,
  onChange,
}: {
  legend: string
  name: string
  options: readonly string[]
  value: string | string[]
  multiple?: boolean
  error?: string
  onChange: (next: string | string[]) => void
}) {
  const selected = (option: string) =>
    Array.isArray(value) ? value.includes(option) : value === option

  const toggle = (option: string) => {
    if (!multiple) return onChange(option)
    const current = Array.isArray(value) ? value : []
    onChange(
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option]
    )
  }

  return (
    <fieldset>
      <legend className="text-small text-muted">{legend}</legend>
      <div className="mt-4 flex flex-wrap gap-3">
        {options.map((option) => {
          const isOn = selected(option)
          return (
            <label
              key={option}
              className={cn(
                'cursor-pointer rounded-full border px-5 py-2.5 text-small transition-all duration-300 ease-brand',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--accent)',
                isOn
                  ? 'border-accent bg-accent text-(--ground)'
                  : 'hairline-2 hover:border-accent hover:text-accent'
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={option}
                checked={isOn}
                onChange={() => toggle(option)}
                className="sr-only"
              />
              {option}
            </label>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-small text-accent">
          {error}
        </p>
      )}
    </fieldset>
  )
}
