"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import CharRainBackground from "./CharRainBackground";
import { useI18n } from "./I18nProvider";

const MotionLink = motion(Link);

export default function CtaSection() {
  const { t } = useI18n();
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <CharRainBackground />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-5"
        >
          {t.cta.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-text-secondary text-lg mb-10"
        >
          {t.cta.desc}
        </motion.p>
        <MotionLink
          href="/download"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="btn-primary text-base !px-10 !py-4"
        >
          {t.cta.button}
        </MotionLink>
      </div>
    </section>
  );
}
