'use client';
import Image from "next/image";
import React from "react";
import { SocialIcon } from "react-social-icons";

interface TeamProps {
  team?: {
    name: string;
    job: string;
    desc: string;
    image: string;
    linkedin: string;
  }[];
}
const Team = ({ team }: TeamProps) => {
  return (
    <section className="px-5 lg:px-16 py-16 lg:py-28 gap-12 lg:gap-20 flex flex-col">
      <div className="flex flex-col gap-3 lg:gap-4">
        <h2 className="uppercase">Introduce the team</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {team?.map((member, index) => (
          <div key={index} className="flex flex-col lg:flex-row gap-5 lg:gap-8">
            <div className="relative w-full aspect-video lg:w-[300px] ">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-5 lg:gap-6">
              <div className="flex flex-col gap-3 lg:gap-4">
                <div>
                  <p className="text-lg font-semibold">{member.name}</p>
                  <p>{member.job}</p>
                </div>
                <p>
                  {member.desc}
                </p>
              </div>
              <div
                onClick={() => window.open(member.linkedin, "_blank")}
                className="cursor-pointer"
                aria-label={`LinkedIn Profile of ${member.name}`}
              >
                <div className="w-10">
                <SocialIcon
                  url={member.linkedin}
                  target="_blank"
                  fgColor={"#EEE"}
                  bgColor={"black"}
                  style={{ width: "32px", height: "32px",borderRadius:"10%" }}
                />
                </div>
               
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;
