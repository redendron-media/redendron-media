import Content from "@/components/sections/aboutUs/content/page";
import Hero from "@/components/sections/aboutUs/hero/page";
import Team from "@/components/sections/aboutUs/team/page";
import Values from "@/components/sections/aboutUs/values/page";
import { sanityClient } from "@/lib/sanity";
import React from "react";

type AboutEntry = {
    values?: {
      icon: string;
      title: string;
      desc: string;
    }[];
  };

  type TeamEntry = {
    team?: {
      name:string;
      job:string;
      desc:string;
      image:string;
      linkedin:string;
    }
  }

  const query = `*[_type == "about"]{
    values[]{
      icon,
      title,
      desc
    },
    team[]{
      name,
      job,
      desc,
      "image": image.asset->url,
      linkedin
    }
  }`;
const AboutUs = async () => {
  const data = await sanityClient.fetch(query);
 const allValues = (data as AboutEntry[]).flatMap((item) => item.values || []);
  const allTeam = (data as TeamEntry[]).flatMap((item) =>item.team || [])
  return (
    <main>
      <Hero />
      <Content />
      <Values values={allValues} />
      <Team team={allTeam}/>
    </main>
  );
};

export default AboutUs;
