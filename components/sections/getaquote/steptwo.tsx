'use client'

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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  businessDesc: z.string().min(10, 'Please describe your business'),
  website: z.string().optional(),
  helpNeeded: z.string().min(10, 'Please share your goals'),
})

type StepTwoValues = z.infer<typeof formSchema>

interface StepTwoProps {
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: StepTwoValues) => void
}

export default function StepTwo({ nextStep, prevStep, updateFormData }: StepTwoProps) {
  const form = useForm<StepTwoValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: '',        
      businessDesc: '',
      website: '',         
      helpNeeded: '',
    },
  })

  const onSubmit = (values: StepTwoValues) => {
    updateFormData(values)
    nextStep()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                When would you like to get started?
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Immediately, Next Month, Q3 2025" {...field} />
              </FormControl>
              <FormMessage className='text-brand-red'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessDesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Please briefly describe your business?
              </FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="We're a small skincare brand launching online..." {...field} />
              </FormControl>
              <FormMessage className='text-brand-red'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Where can we find your website, if you have one?
              </FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage className='text-brand-red'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="helpNeeded"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                What would you like our help with? And how will you measure the success of the project?
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-brand-red'/>
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={prevStep}>
            ← Previous Step
          </Button>
          <Button type="submit">
            Next Step →
          </Button>
        </div>
      </form>
    </Form>
  )
}
