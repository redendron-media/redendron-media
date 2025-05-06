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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  referral: z.array(z.string()).min(1, 'Please select at least one option'),
  otherReferral: z.string().optional(),
})

type StepOneValues = z.infer<typeof formSchema>

interface StepOneProps {
  nextStep: () => void
  updateFormData: (data: StepOneValues) => void
}

export default function StepOne({ nextStep, updateFormData }: StepOneProps) {
  const form = useForm<StepOneValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      referral: [],
      otherReferral: '',
    },
  })

  const onSubmit = (values: StepOneValues) => {
    updateFormData(values)
    nextStep()
  }

  const referralOptions = ['Friend', 'Instagram', 'Facebook', 'Speaking', 'Podcast', 'Other']
  const selected = form.watch('referral') || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is your name?</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage className="text-brand-red" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is your email?</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage className="text-brand-red" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referral"
          render={() => (
            <FormItem>
              <FormLabel>Where did you hear about us?</FormLabel>
              <div className="grid grid-cols-4 gap-3">
                {referralOptions.map((option) => (
                  <FormField
                    key={option}
                    control={form.control}
                    name="referral"
                    render={({ field }) => {
                      const isChecked = field.value?.includes(option)

                      const handleChange = (checked: boolean) => {
                        if (checked) {
                          field.onChange([...field.value, option])
                        } else {
                          field.onChange(field.value.filter((val: string) => val !== option))
                        }
                      }

                      return (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={handleChange}
                              id={`ref-${option.toLowerCase()}`}
                              className="peer hidden"
                            />
                          </FormControl>
                          <label
                            htmlFor={`ref-${option.toLowerCase()}`}
                            className={`
                              cursor-pointer px-4 py-2 text-sm border rounded-md text-center w-full
                              transition-colors
                              ${isChecked ? 'bg-brand-grey' : 'bg-white hover:bg-neutral-lightest'}
                            `}
                          >
                            {option}
                          </label>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage className="text-brand-red" />
            </FormItem>
          )}
        />

        {selected.includes('Other') && (
          <FormField
            control={form.control}
            name="otherReferral"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specify other source</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Twitter, Google" {...field} />
                </FormControl>
                <FormMessage className="text-brand-red" />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-fit self-end">
          Next Step →
        </Button>
      </form>
    </Form>
  )
}
