import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, SubmitEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitContact } from './api'
import { contactSchema } from './types'
import type { ContactPayload } from './types'

const emptyValues: ContactPayload = { name: '', email: '', organization: '', message: '' }
const fields = [
  { name: 'name', label: 'שם', autoComplete: 'name', required: true },
  { name: 'email', label: 'כתובת דוא״ל', autoComplete: 'email', required: true },
  { name: 'organization', label: 'ארגון (אם יש)', autoComplete: 'organization', required: false },
  { name: 'message', label: 'כתבו כאן את תוכן הפנייה', autoComplete: 'off', required: true },
] as const

type Field = keyof ContactPayload

export default function ContactForm() {
  const id = useId()
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [isPending, setIsPending] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const controls = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement>>>({})
  const successHeading = useRef<HTMLHeadingElement>(null)
  const restoreFocus = useRef(false)
  const submitting = useRef(false)

  useEffect(() => {
    if (isSubmitted) successHeading.current?.focus()
    else if (restoreFocus.current) {
      controls.current.name?.focus()
      restoreFocus.current = false
    }
  }, [isSubmitted])

  const handleChange = (field: Field, value: string) => {
    if (submitting.current) return
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      const result = contactSchema.shape[field].safeParse(value)
      setErrors((current) => ({ ...current, [field]: result.success ? undefined : result.error.issues[0].message }))
    }
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    setSubmissionError('')

    const result = contactSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: Partial<Record<Field, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field
        nextErrors[field] ??= issue.message
      }
      setErrors(nextErrors)
      const firstInvalid = fields.find((field) => nextErrors[field.name])
      if (firstInvalid) controls.current[firstInvalid.name]?.focus()
      return
    }

    submitting.current = true
    setIsPending(true)
    setErrors({})
    try {
      await submitContact(result.data)
      setValues(emptyValues)
      setIsSubmitted(true)
    } catch {
      setSubmissionError('לא התקבל אישור לשליחת ההודעה. הפרטים נשמרו בטופס ואפשר לנסות שוב. ייתכן שההודעה כבר נשלחה; ניסיון נוסף עלול לשלוח אותה שוב.')
    } finally {
      submitting.current = false
      setIsPending(false)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-[516px] rounded-[20px] border border-[#E9C863] bg-white p-5 sm:p-10">
      {isSubmitted ? (
        <div className="relative flex min-h-[200px] flex-col items-center justify-center gap-5 text-center md:min-h-[450px] md:gap-10">
          <button
            type="button"
            onClick={() => {
              restoreFocus.current = true
              setIsSubmitted(false)
            }}
            className="absolute -top-4 -left-4 rounded-full p-1 text-[#C3C3C3] transition-colors hover:bg-[#FDFBF6] hover:text-[#1E8025] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8025] sm:-top-6 sm:-left-6"
            aria-label="סגור"
          >
            <X className="size-10" aria-hidden="true" />
          </button>
          <img src="/legacy/images/mark.png" width={80} height={80} className="size-20" alt="" />
          <div role="status" className="flex w-full flex-col items-center gap-[10px]">
            <h3 ref={successHeading} tabIndex={-1} className="text-lg font-bold text-[#1E8025] focus-visible:outline-2 focus-visible:outline-offset-2 md:text-2xl">
              ההודעה נשלחה בהצלחה!
            </h3>
            <p className="text-base text-[#484C56] md:text-lg">
              מישהו מהצוות שלנו ייצור קשר איתך בקרוב.
            </p>
          </div>
        </div>
      ) : (
        <>
          <form noValidate onSubmit={handleSubmit} aria-busy={isPending}>
            <fieldset disabled={isPending} className="flex min-w-0 flex-col gap-5 disabled:opacity-70 md:gap-10">
              <legend className="sr-only">יצירת קשר</legend>
              {fields.map((field) => {
                const error = errors[field.name]
                const controlClassName = `w-full border-b bg-transparent text-right text-base text-[#59687D] outline-none placeholder:text-base placeholder:font-medium focus:border-b-[#E9C863] focus:placeholder:text-[#E9C863] focus-visible:ring-2 focus-visible:ring-[#E9C863] focus-visible:ring-offset-2 ${error ? 'border-b-[#CEA073] placeholder:text-[#CEA073]' : 'border-b-[#59687D]/39 placeholder:text-[#59687D]'}`
                const controlProps = {
                  id: `${id}-${field.name}`,
                  name: field.name,
                  value: values[field.name],
                  required: field.required,
                  autoComplete: field.autoComplete,
                  'aria-invalid': Boolean(error),
                  'aria-describedby': error ? `${id}-${field.name}-error` : undefined,
                  placeholder: field.label,
                  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(field.name, event.target.value),
                  ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => { controls.current[field.name] = node ?? undefined },
                }
                return (
                  <div key={field.name} className="min-w-0">
                    <label htmlFor={controlProps.id} className="sr-only">{field.label}</label>
                    <div className="relative">
                      {field.name === 'message' ? (
                        <textarea {...controlProps} className={`${controlClassName} block min-h-[120px] resize-y`} />
                      ) : (
                        <input {...controlProps} type={field.name === 'email' ? 'email' : 'text'} dir={field.name === 'email' ? 'ltr' : undefined} className={`${controlClassName} h-10`} />
                      )}
                      {(field.name === 'name' || field.name === 'email') && !values[field.name] ? (
                        <span aria-hidden="true" className={`pointer-events-none absolute top-0 flex h-10 items-center pr-1 text-[#E9C863] ${field.name === 'name' ? 'right-[40px]' : 'right-[100px]'}`}>*</span>
                      ) : null}
                    </div>
                    {error ? <p id={`${id}-${field.name}-error`} className="mt-1 text-right text-sm break-words text-[#CEA073]">{error}</p> : null}
                  </div>
                )
              })}
              {submissionError ? <p role="alert" className="text-sm text-destructive">{submissionError}</p> : null}
              <Button type="submit" disabled={isPending} className="h-10 w-full max-w-[192px] rounded-full bg-[#1E8025] text-lg font-extrabold text-white hover:bg-green-700">
                {isPending ? 'שולח…' : 'שליחה'}
              </Button>
            </fieldset>
            <span role="status" className="sr-only">{isPending ? 'שולח…' : ''}</span>
          </form>
          <p className="mt-2 text-sm">השארת פרטים מהווה הסכמה למדיניות הפרטיות.</p>
        </>
      )}
    </div>
  )
}
