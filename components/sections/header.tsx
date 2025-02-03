"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { NavbarScrollProps } from "@/lib/types";
import { links, packages } from "@/constants/links";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
import { Button } from "../ui/button";
import { ChevronDown, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

function Header() {
  const [navbar, setNavbar] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  // const tl = gsap.timeline({ paused: true });
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const packageRef = useRef<HTMLDivElement | null>(null);


  const toggleMenu = () => {
    setNavbar((prevOpen) => {
      const isOpening = !prevOpen;

      // if (isOpening) {
      //   tl.play();
      // } else {
      //   tl.reverse();
      // }

      return isOpening;
    });
  };

  const togglePackages = () => {
    setPackagesOpen((prevOpen) => !prevOpen);
  };

 
  // useGSAP(() => {
  //   tl.fromTo(
  //     navbarRef.current,
  //     { autoAlpha: 0, y: -50 },
  //     { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }
  //   );

  // }, []);

  const Navbar: React.FC<NavbarScrollProps> = ({ toggleMenu }) => {
    return (
      <nav className="flex justify-between lg:justify-start lg:gap-6 px-5 py-4 items-center border-b border-b-black menu-container">
        <Link href={"/"}>
          <Image
            src={"/logo/logolight.svg"}
            width={135}
            height={33}
            alt="logo"
          />
        </Link>
        <div className="lg:flex w-full hidden flex-row justify-between">
          <ul className="flex flex-row gap-8 h-full py-2">
            {links.map((link) => (
              <li key={link.link}>
                <Link href={link.link} className="py-1 h-full">
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <button  onClick={togglePackages}>
              <div className="flex flex-row gap-1 items-center cursor-pointer select-none" data-state={packagesOpen? 'open' : 'closed'}>
                <span className=""> Packages</span>{" "}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",packagesOpen ? 'rotate-180': '')} />
              </div>
              </button>
            
            </li>
          </ul>
          <Button>Get a Quote</Button>
        </div>
        <Icon
          onClick={toggleMenu}
          icon="radix-icons:hamburger-menu"
          className="text-2xl menu-open lg:hidden"
        />
      </nav>
    );
  };
  return (
    <>
      <Navbar toggleMenu={toggleMenu} />

      <div
     
        className={`overflow-hidden flex-row flex  gap-8 justify-center bg-brand-grey `}
        ref={packageRef}
        style={{
          height: packagesOpen ? `auto` : "0",
          paddingTop: packagesOpen ? `32px` : "0",
          paddingBottom: packagesOpen ? `32px` : "0",
          paddingLeft: packagesOpen ? `64px` : "0",
          paddingRight: packagesOpen ? `32px` : "0",
          transition:'height 1200ms ease-in-out",'
        }}
      >
        {packages[0].link.map((item) => (
          <Link key={item.id} href={item.path}>
            <div className="gap-3 flex flex-row py-2">
              <Icon icon={item.icon} className="text-2xl" />
              <p className="uppercase text-base font-medium">{item.name}</p>
            </div>
          </Link>
        ))}
      </div>
      {navbar && (
        <div
          ref={navbarRef}
          className="menu-overlay fixed left-0 top-0 z-50 h-screen w-full origin-top bg-white px-5 md:px-24 py-6 menu-overlay"
        >
          <div className="relative ">
            <Icon
              onClick={toggleMenu}
              icon="material-symbols:close-rounded"
              className="text-2xl absolute right-0 top-0"
            />
          </div>
          <div className="flex flex-col gap-5 pt-14">
            <Accordion type="single" collapsible className="shadow-none">
              <AccordionItem value="item-1" className="shadow-none border-0">
                <AccordionTrigger className="shadow-none py-0">
                  Packages
                </AccordionTrigger>
                <AccordionContent className="shadow-none bg-brand-grey py-4 mt-3">
                  <div className="flex flex-col gap-2">
                    <ul className="py-2">
                      {packages[0].link.map((item) => (
                        <Link key={item.id} href={item.path}>
                          <li className="gap-3 flex flex-row py-2">
                            <Icon icon={item.icon} className="text-2xl" />
                            <p className="uppercase text-base font-medium">
                              {item.name}
                            </p>
                          </li>
                        </Link>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
