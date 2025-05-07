'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  budget: z.enum(['< $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+']),
})

type StepThreeValues = z.infer<typeof formSchema>

interface StepThreeProps {
  prevStep: () => void
  formData: any
}

export default function StepThree({ prevStep, formData }: StepThreeProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<StepThreeValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: '< $1,000',
    },
  })

  const onSubmit = async (values: StepThreeValues) => {
    const finalData = { ...formData, ...values }
  
    try {
      const res = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })
  
      if (!res.ok) {
        const errorData = await res.json()
        console.error('❌ Submission failed:', errorData)
        // Optional: show user an error message here
        return
      }
  
      // ✅ Submission successful
      setIsSubmitted(true)
    } catch (err) {
      console.error('❌ API error:', err)
  
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isSubmitted ? (
          <div className="text-center py-8">
            <h2 >Thank you!</h2>
            <p className=" mt-2">   We&apos;ve received your information and will get back to you shortly.</p>
          </div>
        ) : (
          <>
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What&apos;s your budget?</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      {['< $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'].map(
                        (value, idx) => (
                          <div key={value} className="w-full">
                            <input
                              type="radio"
                              id={`budget-${idx}`}
                              value={value}
                              checked={field.value === value}
                              onChange={() => field.onChange(value)}
                              className="peer hidden"
                            />
                            <label
                              htmlFor={`budget-${idx}`}
                              className={`
                                block w-full cursor-pointer px-4 py-2 text-sm border rounded-md text-center
                                transition-colors
                                peer-checked:bg-black peer-checked:text-white
                                bg-gray-100 hover:bg-gray-200
                              `}
                            >
                              {value}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-brand-red" />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep}>
                ← Back
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  )
}
