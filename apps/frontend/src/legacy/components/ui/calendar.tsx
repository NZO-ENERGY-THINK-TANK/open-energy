'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';

import { cn } from '@/legacy/lib/utils';
import { buttonVariants } from '@/legacy/components/ui/button';

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const navigationButtonClassName = cn(
    buttonVariants({ variant: 'outline' }),
    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('relative p-3', className)}
      classNames={{
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'space-y-4',
        month_caption: 'flex h-7 items-center justify-center px-8',
        caption_label: 'inline-flex items-center gap-1 text-sm font-medium',
        nav: 'absolute inset-x-3 top-3 flex items-center justify-between',
        button_previous: navigationButtonClassName,
        button_next: navigationButtonClassName,
        chevron: 'h-4 w-4',
        dropdowns: 'flex items-center justify-center gap-2',
        dropdown_root:
          'relative inline-flex items-center rounded-md border border-input px-2 py-1 focus-within:ring-2 focus-within:ring-ring',
        dropdown:
          'absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground',
        week: 'mt-2 flex w-full',
        day: 'relative h-9 w-9 p-0 text-center text-sm focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal'
        ),
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground',
        today:
          '[&:not([aria-selected=true])>button]:bg-accent [&:not([aria-selected=true])>button]:text-accent-foreground',
        outside:
          'text-muted-foreground opacity-50 [&[aria-selected=true]>button]:bg-accent/50 [&[aria-selected=true]>button]:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_start: 'rounded-s-md bg-accent',
        range_end: 'rounded-e-md bg-accent',
        range_middle:
          'bg-accent [&[aria-selected=true]>button]:rounded-none [&[aria-selected=true]>button]:bg-accent [&[aria-selected=true]>button]:text-accent-foreground [&[aria-selected=true]>button]:hover:bg-accent [&[aria-selected=true]>button]:hover:text-accent-foreground [&[aria-selected=true]>button]:focus:bg-accent [&[aria-selected=true]>button]:focus:text-accent-foreground',
        hidden: 'invisible',
        week_number: 'h-9 w-9 text-center text-sm text-muted-foreground',
        week_number_header: 'w-9',
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation = 'left', size = 16, disabled, ...props }) => {
          const Icon = {
            down: ChevronDown,
            left: ChevronLeft,
            right: ChevronRight,
            up: ChevronUp,
          }[orientation];

          return <Icon className={cn(className, disabled && 'opacity-50')} size={size} {...props} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
