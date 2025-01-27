"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import zor from "@/public/clientlogo/zor.svg";
import advertwise from "@/public/clientlogo/advertwise.svg";
import agapi from "@/public/clientlogo/agapi.svg";
import brunch from "@/public/clientlogo/brunch.svg";
import cats from "@/public/clientlogo/cats.svg";
import craftedfiber from "@/public/clientlogo/craftedfiber.svg";
import dash from "@/public/clientlogo/dash.svg";
import dt from "@/public/clientlogo/dt.svg";
import easyeats from "@/public/clientlogo/easyeats.svg";
import finova from "@/public/clientlogo/finova.svg";
import max from "@/public/clientlogo/max.svg";
import offbeat from "@/public/clientlogo/offbeat.svg";
import quadraplus from "@/public/clientlogo/quadraplus.svg";
import ssasc from "@/public/clientlogo/ssasc.svg";
import vnhs from "@/public/clientlogo/vnhs.svg";
import { StaticImageData } from "next/image";

interface Logo {
  name: string;
  id: number;
  img: string | StaticImageData;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos);
  const columns: Logo[][] = Array.from({ length: columnCount }, () => []);

  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo);
  });

  return columns;
};

interface LogoColumnProps {
  logos: Logo[];
  index: number;
  currentTime: number;
}

const getImageSource = (img: string | StaticImageData): string => {
  if (typeof img === "string") return img;
  return img.src;
};

const LogoColumn: React.FC<LogoColumnProps> = React.memo(
  ({ logos, index, currentTime }) => {
    const cycleInterval = 2000;
    const columnDelay = index * 200;
    const adjustedTime =
      (currentTime + columnDelay) % (cycleInterval * logos.length);
    const currentIndex = Math.floor(adjustedTime / cycleInterval);

    return (
      <motion.div
        className="w-24 h-14 md:w-48 md:h-24 overflow-hidden relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${logos[currentIndex].id}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: {
                type: "tween",
                ease: "easeIn",
                duration: 0.3,
              },
            }}
          >
            <img
              src={getImageSource(logos[currentIndex].img)}
              alt={logos[currentIndex].name}
              className="w-20 h-20 md:w-32 md:h-32 max-w-[80%] max-h-[80%] object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }
);

function LogoSlider() {
  const [logoSets, setLogoSets] = useState<Logo[][]>([]);
  const [currentTime, setCurrentTime] = useState(0);

 
  const getColumnCount = (): number => {
    if (window.innerWidth >= 1024) return 5; // Large screens
    if (window.innerWidth >= 768) return 3; // Medium screens
    return 2; // Small screens
  };

  const [columnCount, setColumnCount] = useState(getColumnCount);

  const updateColumnCount = useCallback(() => {
    setColumnCount(getColumnCount());
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, [updateColumnCount]);

  const allLogos: Logo[] = useMemo(
    () => [
      { name: "Zor", id: 1, img: zor },
      { name: "Crafted Fibers", id: 2, img: craftedfiber },
      { name: "Agapi", id: 3, img: agapi },
      { name: "Cats", id: 4, img: cats },
      { name: "Max For CEO", id: 5, img: max },
      { name: "Advertwise", id: 6, img: advertwise },
      { name: "Finova", id: 7, img: finova },
      { name: "Brunch Boxx", id: 8, img: brunch },
      { name: "Quadraplus", id: 9, img: quadraplus },
      { name: "Easy Eats", id: 10, img: easyeats },
      { name: "Offbeat Sikkim", id: 11, img: offbeat },
      { name: "Dreamer Tribe", id: 12, img: dt },
      { name: "SSASC", id: 13, img: ssasc },
      { name: "Dash", id: 14, img: dash },
      { name: "VNHS", id: 15, img: vnhs },
    ],
    []
  );

  useEffect(() => {
    const distributedLogos = distributeLogos(allLogos, columnCount);
    setLogoSets(distributedLogos);
  }, [allLogos, columnCount]);

  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(updateTime, 100);
    return () => clearInterval(intervalId);
  }, [updateTime]);

  return (
    <div className="flex space-x-4">
      {logoSets.map((logos, index) => (
        <LogoColumn
          key={index}
          logos={logos}
          index={index}
          currentTime={currentTime}
        />
      ))}
    </div>
  );
}

export default LogoSlider;
