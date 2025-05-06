import React from "react";

interface credibilityProps {
  credibility: {
    title: string;
    value: string;
    desc: string;
  }[];
}
const Credibility = ({ credibility }: credibilityProps) => {
  return (
    <section className="bg-black py-16 text-white lg:py-28 flex flex-col px-5 lg:px-16 gap-12 lg:gap-20">
      <h3 className="uppercase w-full lg:w-3/4">
        Turning Strategies into Tangible Results
      </h3>
      <div className="flex flex-col lg:flex-row gap-8">
        {credibility.map((cred, index) => (
          <div
            key={index}
            className="flex flex-col p-8 gap-12 border border-white flex-1 min-w-0"
          >
            <h6 className="uppercase">{cred.title}</h6>
            <div className="flex flex-col gap-4">
              <h4 className="font-roboto text-6xl font-bold lg:text-end">
                {cred.value}
              </h4>
              <div className="h-1 bg-white w-full" />
              <p>{cred.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Credibility;
