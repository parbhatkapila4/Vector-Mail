"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className="group relative cursor-pointer px-4 py-2 text-white hover:text-purple-300"
        whileHover={{ scale: 1.05 }}
      >
        {item}
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute left-1/2 top-[calc(100%_+_1.2rem)] -translate-x-1/2 transform pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="overflow-hidden rounded-2xl border border-purple-500/30 bg-black/90 shadow-2xl shadow-purple-500/20 backdrop-blur-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,0,50,0.9) 100%)",
                }}
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="h-full w-max p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative flex justify-center space-x-4 rounded-full border border-purple-500/30 bg-black/80 px-8 py-6 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,0,50,0.8) 100%)",
      }}
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="mb-1 text-xl font-bold text-white">{title}</h4>
        <p className="max-w-[10rem] text-sm text-neutral-300">{description}</p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="inline-block text-neutral-300 transition-all duration-200 hover:translate-x-1 hover:text-purple-300"
    >
      {children}
    </Link>
  );
};
