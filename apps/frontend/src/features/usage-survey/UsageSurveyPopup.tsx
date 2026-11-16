import { useEffect, useId, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { submitUsageReason } from './api'
import type { UsageReason } from './api'

const sessionKey = 'newsletter-submitted'
const interests = [
  { reason: 1, label: 'פרטי' },
  { reason: 2, label: 'אקדמי' },
  { reason: 3, label: 'עיתונאי' },
  { reason: 4, label: 'עסקי' },
  { reason: 5, label: 'אחר' },
] as const

export default function UsageSurveyPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectedReason, setSelectedReason] = useState<UsageReason>()
  const [error, setError] = useState<string>()
  const id = useId()

  useEffect(() => {
    try {
      if (sessionStorage.getItem(sessionKey)) return
    } catch {
      // The optional survey still works when browser storage is unavailable.
    }
    const timer = window.setTimeout(() => setIsOpen(true), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  const finishSurvey = () => {
    try {
      sessionStorage.setItem(sessionKey, 'true')
    } catch {
      // Storage restrictions must not prevent visitors from continuing.
    }
    setIsOpen(false)
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return
    setError(undefined)

    if (selectedReason === undefined) {
      finishSurvey()
      return
    }

    setIsPending(true)
    try {
      await submitUsageReason(selectedReason)
      finishSurvey()
    } catch {
      setError('לא ניתן לשלוח את התשובה כרגע. אפשר לנסות שוב או לסגור ולהמשיך לגלוש.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isPending) setIsOpen(open) }}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        overlayClassName="bg-black/30"
        className="block max-h-[calc(100svh-8rem)] w-[calc(100%-2rem)] max-w-[447px] overflow-y-auto rounded-2xl border-[#357A5B] bg-white p-[30px] sm:max-w-[447px]"
        onEscapeKeyDown={(event) => { if (isPending) event.preventDefault() }}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogClose
          disabled={isPending}
          aria-label="סגירה והמשך גלישה"
          className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-lg text-[#59687D] hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
        >
          <X size={20} aria-hidden="true" />
        </DialogClose>

        <DialogHeader className="gap-0 text-right">
          <DialogTitle className="pr-0 pl-3 text-[28px] leading-tight font-extrabold text-[#484C56] md:text-[34px]">
            השימוש באתר חופשי וללא עלות!
          </DialogTitle>
          <div className="my-4 mr-0 h-1 w-[46px] bg-[#276E4E]" />
          <DialogDescription className="mb-6 text-base leading-relaxed text-gray-600">
            לאיזה צורך השימוש שלך באתר?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isPending}>
          <fieldset disabled={isPending} className="space-y-3 disabled:opacity-60">
            <legend className="sr-only">מטרת השימוש באתר (לא חובה)</legend>
            {interests.map((interest) => (
              <label
                key={interest.reason}
                htmlFor={`${id}-${interest.reason}`}
                className="flex cursor-pointer items-center gap-3 text-gray-700"
              >
                <input
                  id={`${id}-${interest.reason}`}
                  type="radio"
                  name={`${id}-interest`}
                  value={interest.reason}
                  checked={selectedReason === interest.reason}
                  onChange={() => setSelectedReason(interest.reason)}
                  className="size-5 shrink-0 accent-[#1E8025]"
                />
                <span className="text-base font-medium text-[#59687D]">{interest.label}</span>
              </label>
            ))}
          </fieldset>

          <p className="text-sm text-gray-600">
            המענה לסקר אינו חובה. למידע על השימוש בנתונים, ראו את{' '}
            <Link to="/terms" className="underline" onClick={() => setIsOpen(false)}>
              מדיניות הפרטיות
            </Link>.
          </p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="h-auto w-max max-w-full rounded-full bg-[#1E8025] px-[30px] py-[10px] text-xl font-extrabold text-white hover:bg-green-700 disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="size-6 animate-spin" aria-hidden="true" />
                <span role="status">שולח…</span>
              </>
            ) : 'המשך גלישה באתר'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
