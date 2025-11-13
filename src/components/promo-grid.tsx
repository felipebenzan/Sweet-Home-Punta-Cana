"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./promo-grid.module.css";
import { ArrowRight } from "lucide-react";
import type { Excursion } from "@/lib/types";
import { getExcursions } from "@/app/server-actions.readonly";
import React from "react";

export default function PromoGrid() {
  const [excursions, setExcursions] = React.useState<Excursion[]>([]);

  React.useEffect(() => {
    // This is a client component, so we fetch data in useEffect
    async function fetchData() {
      try {
        const data = await getExcursions();
        setExcursions(data);
      } catch (error) {
        console.error("Failed to fetch excursions for promo grid:", error);
      }
    }
    fetchData();
  }, []);

  const promoData = [
    {
      excursion: excursions.find((e) => e.slug === "isla-saona"),
      theme: "dark",
    },
    {
      excursion: excursions.find((e) => e.slug === "adventure-buggies"),
      theme: "light",
    },
    {
      href: "https://www.scooterspc.com",
      target: "_blank",
      theme: "light",
      headline: "Scooter Rentals",
      subheadline:
        "Explore Punta Cana at your own pace. Rent a scooter right at Sweet Home.",
      ctaPrimary: { label: "Reserve Now", href: "https://www.scooterspc.com" },
      image: {
        src: "https://iampuntacana.com/wp-content/uploads/2025/09/unnamed.png",
        alt: "Scooter parked on a tropical street",
        hint: "scooter rental",
      },
    },
    {
      href: "https://www.iampuntacana.com",
      target: "_blank",
      theme: "dark",
      headline: "Discover Punta Cana",
      subheadline:
        "Explore on your own terms. Visit IAmPuntaCana.com for local tips and guides.",
      ctaPrimary: { label: "Get Tips", href: "https://www.iampuntacana.com" },
      image: {
        src: "https://picsum.photos/600/400",
        alt: "Map and camera for local exploration",
        hint: "travel map",
      },
    },
  ].filter((p) => p.href || (p.excursion && p.excursion.promo));

  return (
    <section className={styles.section} id="excursions">
      <div className={styles.container}>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-shpc-ink">
            Collect Memories
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Curated experiences to make your stay unforgettable.
          </p>
        </div>
        <div className={styles.grid}>
          {promoData.map((promo, index) => {
            const headline = promo.excursion?.promo?.headline || promo.headline;
            const subheadline =
              promo.excursion?.promo?.subheadline || promo.subheadline;
            const image = promo.excursion?.image || promo.image?.src;
            const alt = promo.excursion?.title || promo.image?.alt;
            const hint = promo.excursion
              ? "vacation excursion"
              : promo.image?.hint;
            const href = promo.excursion
              ? `/excursions/${promo.excursion.slug}`
              : promo.href;
            const ctaLabel = promo.excursion
              ? "Book Now"
              : promo.ctaPrimary?.label;

            if (!headline) return null; // Don't render if there's no data yet

            return (
              <article
                key={index}
                className={`${styles.tile} ${
                  promo.theme === "dark" ? styles.tileDark : ""
                }`}
              >
                <Link
                  href={href || "#"}
                  target={promo.target || "_self"}
                  aria-label={headline}
                  className={styles.link}
                >
                  <div className={styles.content}>
                    <div>
                      <h3 className={styles.headline}>{headline}</h3>
                      <p className={styles.subheadline}>{subheadline}</p>
                      <div className={styles.ctaContainer}>
                        <span className={`${styles.cta} ${styles.ctaPrimary}`}>
                          {ctaLabel} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                  {image && (
                    <div className={styles.imageContainer}>
                      <Image
                        src={image}
                        alt={alt || ""}
                        fill
                        className={styles.image}
                        data-ai-hint={hint}
                      />
                    </div>
                  )}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
