import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.css";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer/page";
import {Roboto} from 'next/font/google'
const neue = localFont({
  src:[
    {
      path: '/fonts/HelveticaNeueRoman.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/HelveticaNeueLight.otf',
      weight: '300',
      style: 'lightl',
    },
    {
      path: '/fonts/HelveticaNeueMedium.otf',
      weight: '500',
      style: 'medium',
    },
    {
      path: '/fonts/HelveticaNeueBold.otf',
      weight: '700',
      style: 'bold',
    },
  ],
})

const roboto = Roboto({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin']

})
export const metadata: Metadata = {
  title: "Redendron Media",
  description:
    "We don&apos;t chase trends — we build anti-fragile brands rooted in truth, strategy, and craft. Born in Sikkim. Built for global relevance.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${neue.className} ${roboto.style} antialiased`}
      >
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
