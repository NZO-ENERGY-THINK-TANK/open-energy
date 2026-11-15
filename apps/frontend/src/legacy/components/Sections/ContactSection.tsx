import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/legacy/components/ui/button';

import { Loader2, X } from 'lucide-react';
import Image from '@/lib/image';
import { useState } from 'react';

const topleft = '/legacy/images/Ellipse 89 (1).png';
const mark = '/legacy/images/mark.png';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'יש למלא את השדה המבוקש')
    .max(200, 'השם יכול להכיל עד 200 תווים'),
  email: z.string().trim().min(1, 'יש למלא את השדה המבוקש')
    .max(254, 'כתובת הדוא"ל יכולה להכיל עד 254 תווים')
    .pipe(z.email('כתובת דוא"ל לא תקינה')),
  organization: z.string().trim().max(200, 'שם הארגון יכול להכיל עד 200 תווים'),
  message: z.string().trim().min(1, 'יש למלא את השדה המבוקש')
    .max(8000, 'תוכן הפנייה יכול להכיל עד 8000 תווים'),
});

const contactResponseSchema = z.object({ ok: z.literal(true) });
type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', organization: '', message: '' },
    // Clear error when user starts typing
    reValidateMode: 'onChange',
  });
  const [name, email] = useWatch({ control, name: ['name', 'email'] });

  const submitContact = async (values: ContactFormValues) => {
    clearErrors('root.server');

    try {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        setError('root.server', {
          type: 'server',
          message: response.status === 503
            ? 'שליחת הפנייה אינה זמינה כרגע. נסו שוב מאוחר יותר.'
            : `שליחת הפנייה נכשלה (HTTP ${response.status}). נסו שוב.`,
        });
        return;
      }

      // Require the original handler's acknowledgement, not a SPA fallback's 200 HTML response.
      const result = contactResponseSchema.safeParse(await response.json().catch(() => null));
      if (!result.success) {
        setError('root.server', {
          type: 'server',
          message: 'לא התקבל אישור מהשרת לשליחת הפנייה. נסו שוב מאוחר יותר.',
        });
        return;
      }

      reset();
      setIsSubmitted(true);
    } catch {
      setError('root.server', {
        type: 'server',
        message: 'לא התקבל אישור לשליחת הפנייה. בדקו את החיבור לאינטרנט ונסו שוב.',
      });
    }
  };

  const getInputClassName = (fieldName: keyof ContactFormValues) => {
    const hasError = errors[fieldName];
    const baseClass = "text-left outline-none placeholder:font-medium placeholder:text-base h-10 w-full !border-b focus:placeholder:text-[#E9C863]";

    if (hasError) {
      return `${baseClass} placeholder:text-[#CEA073] !border-b-[#CEA073]`;
    }
    return `${baseClass} placeholder:text-[#59687D] !border-b-[#59687D]/39`;
  };

  const getTextareaClassName = () => {
    const hasError = errors.message;
    const baseClass = "text-left outline-none placeholder:font-medium placeholder:text-base min-h-[120px] h-[80px] resize-none w-full border-b focus:placeholder:text-[#E9C863]";

    if (hasError) {
      return `${baseClass} placeholder:text-[#CEA073] border-b-[#CEA073]`;
    }
    return `${baseClass} placeholder:text-[#59687D] border-b-[#59687D]/39`;
  };

  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='size-[600px] absolute top-0 left-0 z-1' alt='image' />

      <div className="container mx-auto px-5 md:py-[52px] py-10 relative w-full overflow-hidden z-10">
        <h1 className="md:text-[45px] text-3xl font-extrabold text-[#484C56] leading-tight">
          יצירת קשר
        </h1>
        <div className="w-[46px] h-1 bg-[#276E4E] md:mt-[18px] mt-3 mr-0"></div>
        <div className="bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] overflow-hidden md:p-10 p-5 md:mt-[30px] mt-5">
          <div className="flex md:flex-row flex-col gap-5 justify-between items-center">
            <div>
              <h2 className="md:text-[34px] text-2xl font-extrabold text-[#484C56] leading-[110%]">
                לא מצאתם מה שחיפשתם?
                <br />
                <span className='text-[#276E4E]'>יש לכם הצעת שיפור?</span>
              </h2>
              <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3 mr-0"></div>
              <p className="text-[#484C56] md:text-lg text-base">
                אתם מוזמנים ליצור איתנו קשר ונענה בהקדם
              </p>
            </div>

            <div className="bg-white rounded-[20px] p-10 border border-[#E9C863] max-w-[516px] w-full">
              {isSubmitted ? (
                <div role="status" className="relative flex flex-col md:gap-10 gap-5 items-center justify-center md:h-[450px] h-[200px] text-center">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="absolute -top-6 -left-6 p-1 rounded-full text-[#484C56] hover:bg-[#FDFBF6] hover:text-[#1E8025] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E8025] focus:ring-offset-2"
                    aria-label="סגור"
                  >
                    <X className="w-10 h-10 text-[#C3C3C3]" />
                  </button>
                  <Image src={mark} width={80} height={80} className='w-[80px] h-[80px]' alt='' />
                  <div className="flex flex-col items-center gap-[10px] text-center w-full">
                    <h3 className="md:text-2xl text-lg font-bold text-[#1E8025]">
                      ההודעה נשלחה בהצלחה!
                    </h3>
                    <p className="text-[#484C56] md:text-lg text-base">
                      מישהו מהצוות שלנו ייצור קשר איתך בקרוב.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit(submitContact)} noValidate aria-busy={isSubmitting} className="flex flex-col md:gap-10 gap-5">
                    <div className="relative">
                      <div className="relative">
                        <input
                          {...register('name')}
                          type="text"
                          maxLength={200}
                          autoComplete="name"
                          aria-label="שם"
                          aria-required="true"
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? 'contact-name-error' : undefined}
                          readOnly={isSubmitting}
                          className={`${getInputClassName('name')}`}
                          placeholder="שם"
                        />
                        {!name && (
                          <span className="absolute right-[40px] top-0 h-10 flex items-center text-[#E9C863] pointer-events-none pr-1">*</span>
                        )}
                      </div>
                      {errors.name && (
                        <p id="contact-name-error" role="alert" className="text-right text-[#CEA073] text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="relative">
                        <input
                          {...register('email')}
                          type="email"
                          maxLength={254}
                          autoComplete="email"
                          aria-label="כתובת דוא״ל"
                          aria-required="true"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'contact-email-error' : undefined}
                          readOnly={isSubmitting}
                          className={`${getInputClassName('email')}`}
                          placeholder="כתובת דוא״ל"
                        />
                        {!email && (
                          <span className="absolute right-[100px] top-0 h-10 flex items-center text-[#E9C863] pointer-events-none pr-1">*</span>
                        )}
                      </div>
                      {errors.email && (
                        <p id="contact-email-error" role="alert" className="text-right text-[#CEA073] text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>


                    <div className="relative">
                      <input
                        {...register('organization')}
                        maxLength={200}
                        autoComplete="organization"
                        aria-label="ארגון (אם יש)"
                        aria-invalid={Boolean(errors.organization)}
                        aria-describedby={errors.organization ? 'contact-organization-error' : undefined}
                        readOnly={isSubmitting}
                        className={`${getInputClassName('organization')}`}
                        placeholder="ארגון (אם יש)"
                      />
                      {errors.organization && (
                        <p id="contact-organization-error" role="alert" className="text-right text-[#CEA073] text-sm mt-1">
                          {errors.organization.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <textarea
                        {...register('message')}
                        maxLength={8000}
                        aria-label="כתבו כאן את תוכן הפנייה"
                        aria-required="true"
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? 'contact-message-error' : undefined}
                        readOnly={isSubmitting}
                        className={`${getTextareaClassName()}`}
                        placeholder="כתבו כאן את תוכן הפנייה"
                      ></textarea>
                      {errors.message && (
                        <p id="contact-message-error" role="alert" className="text-right text-[#CEA073] text-sm mt-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {errors.root?.server && (
                      <p role="alert" className="text-right text-red-700 text-sm">
                        {errors.root.server.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="max-w-[192px] w-full bg-[#1E8025] text-white rounded-full h-10 text-lg font-extrabold disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                          שולח…
                        </>
                      ) : 'שליחה'}
                    </Button>

                  </form>
                  <p className='mt-2 text-[14px]'>
                    השארת פרטים מהווה הסכמה למדיניות הפרטיות.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}