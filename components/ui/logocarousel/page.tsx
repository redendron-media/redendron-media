"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { sanityClient } from "@/lib/sanity";

interface Logo {
  name: string;
  id: number;
  img: string;
}

const fetchClientLogos = async (): Promise<Logo[]> => {
  const query = `*[_type == "clientLogo"]{
    _id,
    name,
    "img": logo.asset->url
  }`;
  const data = await sanityClient.fetch(query);
  return data.map((logo: any) => ({
    id: logo._id,
    name: logo.name,
    img: logo.img,
  }));
};

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

// const getImageSource = (img: string): string => {
//   if (typeof img === "string") return img;
//   return img.src;
// };

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
        transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {logos[currentIndex] && (
            <motion.div
              key={`${logos[currentIndex].id}-${currentIndex}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ y: "10%", opacity: 0 }}
              animate={{
                y: "0%",
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  mass: 1,
                  duration: 0.5,
                },
              }}
              exit={{
                y: "-20%",
                opacity: 0,
                transition: { type: "tween", ease: "easeIn", duration: 0.3 },
              }}
            >
              <img
                src={logos[currentIndex].img}
                alt={logos[currentIndex].name}
                className="w-20 h-20 md:w-32 md:h-32 max-w-[80%] max-h-[80%] object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);
LogoColumn.displayName = "LogoColumn";
function LogoSlider() {
  const [logoSets, setLogoSets] = useState<Logo[][]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const getColumnCount = (): number => {
    if (window.innerWidth >= 1024) return 5; // Large screens
    if (window.innerWidth >= 768) return 3; // Medium screens
    return 2; // Small screens
  };
  const [allLogos, setAllLogos] = useState<Logo[]>([]);
  const [columnCount, setColumnCount] = useState(2);
  const updateColumnCount = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) setColumnCount(5);
      else if (window.innerWidth >= 375) setColumnCount(3);
      else setColumnCount(2);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, [updateColumnCount]);

  useEffect(() => {
    const getColumnCount = () => {
      if (window.innerWidth >= 1024) return 5;
      if (window.innerWidth >= 768) return 3;
      return 2;
    };

    setColumnCount(getColumnCount());
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, [updateColumnCount]);

  useEffect(() => {
    const loadLogos = async () => {
      const logos = await fetchClientLogos();
      setAllLogos(logos);
      const distributed = distributeLogos(logos, columnCount);
      setLogoSets(distributed);
    };

    loadLogos();
  }, [columnCount]);

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
