'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@iconify/react'
import React, { useState } from 'react'
import Link from 'next/link'

const formSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  message: z.string().optional(),
})

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        console.error('Failed to send message')
        setIsSubmitting(false)
        return
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Form submission error', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="px-5 py-16 lg:px-16 lg:py-28 flex flex-col lg:flex-row gap-12 lg:gap-20">
      <div className="flex w-full lg:w-1/2 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2>Still got questions? We&apos;re here to help!</h2>
        </div>
        <div className="flex flex-col gap-4">
          <p className="flex flex-row gap-4 items-center">
            <Icon icon="material-symbols:mail-outline" className="text-2xl" />
            team@redendron.com
          </p>
          <p className="flex flex-row gap-4 items-center">
            <Icon icon="tabler:phone" className="text-2xl" />
            +91 9876543210
          </p>
          <Link
            href="https://maps.app.goo.gl/6yU58VWxymwe8NS59"
            target="_blank"
            className="flex flex-row gap-4 items-center"
          >
            <Icon icon="akar-icons:location" className="text-2xl" />
            Sanctorum Coworking, Development Area, Gangtok, Sikkim, India
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/2">
        {isSubmitted ? (
          <div className="text-xl font-medium text-green-700">
            Thanks for reaching out! Our team will get back to you shortly.
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-3xl mx-auto py-10"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage className="text-brand-red" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage className="text-brand-red" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage className="text-brand-red" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage className="text-brand-red" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-brand-red" />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </section>
  )
}

export default Contact
