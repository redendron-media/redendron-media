"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const Navbar: React.FC<NavbarScrollProps> = React.memo(
  ({ toggleMenu, packagesOpen, togglePackages }) => {
    const pathname = usePathname();
    return (
      <nav className="flex justify-between lg:justify-between lg:gap-6 px-5 py-4 items-center border-b border-b-black menu-container z-50">
        <Link href={"/"}>
          <Image
            src="/logo/logolight.svg"
            width={135}
            height={33}
            alt="logo"
            priority
          />
        </Link>
        <div className="lg:flex w-fit hidden flex-row justify-between">
          <ul className="flex flex-row gap-8 h-full py-2">
            {links.map((link) => (
           <li key={link.link}>
           <Link
             href={link.link}
             className={cn(
               "py-1 h-full hover:text-brand-red transition-colors duration-300",
               pathname.startsWith(link.link) ? "text-brand-red" : ""
             )}
           >
             {link.name}
           </Link>
         </li>
         
            ))}
            <li>
              <button onClick={togglePackages}>
                <div
                  className="flex flex-row gap-1 items-center cursor-pointer select-none"
                  data-state={packagesOpen ? "open" : "closed"}
                >
                  <span className="">Packages</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      packagesOpen ? "rotate-180" : ""
                    )}
                  />
                </div>
              </button>
            </li>
          </ul>
        </div>
        <Link href={"/getAQuote"}>
          <Button className="hidden lg:flex">Get a Quote</Button>
        </Link>
        <Icon
          onClick={toggleMenu}
          icon="radix-icons:hamburger-menu"
          className="text-2xl menu-open lg:hidden"
        />
      </nav>
    );
  }
);
Navbar.displayName = "Navbar";

function Header() {
  const [navbar, setNavbar] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const packageRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const el = packageRef.current;
    const isLargeScreen = window.innerWidth >= 1024;
    if (!el || !isLargeScreen) return;

    if (packagesOpen) {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: -10,
          display: "none",
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
        {
          opacity: 1,
          y: 0,
          display: "flex",
          height: "auto",
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 64,
          paddingRight: 32,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    } else {
      gsap.to(el, {
        opacity: 0,
        y: -10,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (el) el.style.display = "none";
        },
      });
    }
  }, [packagesOpen]);

  const toggleMenu = () => {
    setNavbar((prevOpen) => {
      const isOpening = !prevOpen;

      return isOpening;
    });
  };

  const togglePackages = () => {
    setPackagesOpen((prevOpen) => !prevOpen);
  };
  const pathname = usePathname();

  return (
    <>
      <Navbar
        toggleMenu={toggleMenu}
        togglePackages={togglePackages}
        packagesOpen={packagesOpen}
      />
      <div
        ref={packageRef}
        className="overflow-hidden flex-row flex gap-20 justify-center bg-brand-grey z-50"
        style={{
          display: "none", // Hidden by default, shown via GSAP
        }}
      >
        {packages[0].link.map((item) => (
          <Link key={item.id} href={`/packages/${item.path}`}>
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
          <div className="flex flex-col gap-5 py-14">
          <ul className="flex flex-col gap-8 h-full py-2">
              {links.map((link) => (
                <li key={link.link}>
                  <Link
                    href={link.link}
                    className={cn(
                      "py-1 h-full",
                      pathname.startsWith(link.link) ? "text-brand-red" : ""
                    )}
                    onClick={toggleMenu}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Accordion type="single" collapsible className="shadow-none">
              <AccordionItem value="item-1" className="shadow-none border-0">
                <AccordionTrigger className="shadow-none py-0">
                  Packages
                </AccordionTrigger>
                <AccordionContent className="shadow-none bg-brand-grey py-4 mt-3">
                  <div className="flex flex-col gap-2">
                    <ul className="py-2">
                      {packages[0].link.map((item) => (
                        <Link onClick={toggleMenu} key={item.id} href={`/packages/${item.path}`}>
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
          <Link href={"/getAQuote"}>
          <Button className="w-full">Get a Quote</Button>
        </Link>
        </div>
      )}
    </>
  );
}

export default Header;
