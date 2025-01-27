import Clients from "@/components/sections/clients/page";
import HeroHome from "@/components/sections/hero/page";
import Quotes from "@/components/sections/quotesslider/page";
import Image from "next/image";
import CaseStudies from "@/components/sections/casestudies/page";
import WordFromClients from "@/components/sections/words/page";

export default function Home() {
  return (
   <main>
    <HeroHome/>
   <Quotes/>
   <Clients/>
   <CaseStudies/>
   <WordFromClients/>
   </main>
  );
}
