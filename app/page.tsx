import Clients from "@/components/sections/home/clients/page";
import HeroHome from "@/components/sections/home/hero/page";
import Quotes from "@/components/sections/home/quotesslider/page";
import Testimonials from '@/components/sections/packages/testimonials/page';
import CaseStudies from "@/components/sections/home/casestudies/page";
import Packages from "@/components/sections/home/packages/page";
import Blogs from "@/components/sections/home/blog/page";
import Contact from "@/components/sections/home/contact/page";

export default function Home() {
  return (
   <main>
    <HeroHome/>
   <Quotes/>
   <Clients/>
   <CaseStudies/>
   <Testimonials/>
   <Packages/>
   <Blogs/>
   <Contact/>
   </main>
  );
}
