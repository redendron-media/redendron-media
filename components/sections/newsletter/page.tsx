"use client";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  email: z.string(),
});

function onSubmit(values: z.infer < typeof formSchema > ) {
    try {
      console.log(values);
    
    } catch (error) {
      console.error("Form submission error", error);
     
    }
  }

const Newsletter = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <section className="py-16 lg:py-28 justify-evenly  flex flex-col lg:flex-row gap-6 lg:gap-20">
      <div className="flex flex-col gap-3 lg:gap-6">
        <h3 className="uppercase">Sign up for our newsletter</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
      </div>
      <div className=" flex flex-col lg:flex-col gap-4 ">
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row gap-4 w-full  p-0 mx-auto">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full ">
              <FormControl>
                <Input 
                placeholder="Enter your email"
                className="h-full placeholder:text-base text-base"
                type="email"
                {...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="px-6 py-3"  type="submit">Subscribe</Button>
      </form>
    </Form>
    <p className="text-xs">By clicking Sign Up you're confirming that you agree with our Terms and Conditions.</p>
      </div>
    </section>
  );
};

export default Newsletter;
