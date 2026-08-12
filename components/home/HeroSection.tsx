"use client";

import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const textReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: "easeOut" },
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-8 text-white sm:px-12 lg:px-16">
      <motion.div
        animate={{ scale: 1.03, x: 0 }}
        className="absolute inset-0"
        initial={{ scale: 1.1, x: -18 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      >
        <Image
          alt="Mountain forest landscape at dusk"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/covoyage-reference-hero-bg.jpg"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(5,5,5,0.72)_58%,#050505_100%)]" />

      <motion.div
        animate="visible"
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-start pb-20 pt-48 sm:pt-52 lg:pt-56"
        initial="hidden"
        transition={{ staggerChildren: 0.14 }}
      >
        <div className="max-w-3xl">
          <motion.h1
            className="font-serif text-4xl leading-[0.95] text-white sm:text-6xl lg:text-7xl"
            variants={textReveal}
          >
            The Art of Shared
            <br />
            Discovery
          </motion.h1>
          <motion.p
            className="mt-7 max-w-2xl text-base leading-8 text-white/78 sm:text-lg"
            variants={textReveal}
          >
            Travel was never meant to be done alone-find your people, share the
            journey, and feel at home anywhere in the world.
          </motion.p>
          <motion.div className="mt-10" variants={textReveal}>
            <Link
              className="group inline-flex items-center gap-5 bg-white/14 px-9 py-5 text-sm font-semibold text-white backdrop-blur-2xl transition duration-300 hover:bg-white/22"
              href="#find-your-tribe"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
