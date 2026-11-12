"use client";

import Link from "next/link";
import { Accordion } from "radix-ui";
import { ArrowRight, ArrowUpRight, Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { homeFaqs } from "@/data/faqs";

/** Faint grid lines behind the panel (site border colour). */
const gridLines =
  "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] bg-center";

export function HomeFaq() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
      <div className="relative overflow-hidden rounded-[28px] bg-muted px-4 py-14 md:px-10 md:py-20">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] ${gridLines}`}
        />

        <div className="relative mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-foreground/70">
              Questions students ask
            </p>
            <h2 className="mt-4 text-4xl leading-[1.05] font-medium tracking-[-0.03em] md:text-6xl">
              Frequently
              <br />
              Asked Questions
            </h2>
          </Reveal>

          <Reveal delay={0.06} className="mt-10 md:mt-12">
            <Accordion.Root type="single" collapsible defaultValue="faq-0" className="space-y-2.5">
              {homeFaqs.map((faq, index) => (
                <Accordion.Item
                  key={faq.question}
                  value={`faq-${index}`}
                  className="group overflow-hidden rounded-[1.6rem] border border-transparent bg-foreground/[0.05] transition-colors duration-300 hover:bg-foreground/[0.08] data-[state=open]:border-border data-[state=open]:bg-white data-[state=open]:shadow-card"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center gap-4 py-2 pr-2 pl-5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:pl-6">
                      <span className="flex-1 py-2.5 text-[15px] font-semibold tracking-[-0.01em] md:text-base">
                        {faq.question}
                      </span>
                      <span
                        aria-hidden
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-foreground shadow-card transition-all duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-muted group-data-[state=open]:shadow-none"
                      >
                        <Plus weight="bold" className="size-4" />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[faq-up_0.25s_ease-out] data-[state=open]:animate-[faq-down_0.3s_ease-out]">
                    <div className="px-5 pb-6 text-sm leading-relaxed text-foreground/70 md:pr-20 md:pl-6 md:text-[15px]">
                      <p>{faq.answer}</p>
                      {faq.link ? (
                        <Link
                          href={faq.link.href}
                          className="mt-3 inline-flex items-center gap-1 font-semibold text-forest underline-offset-4 hover:underline"
                        >
                          {faq.link.label}
                          <ArrowUpRight weight="bold" className="size-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="text-base font-semibold tracking-[-0.01em] md:text-lg">
              Still not sure? Your profile answers most of it.
            </p>
            <MagneticWrap>
              <Button asChild size="lg" className="group">
                <Link href="/consultation">
                  Get your free profile evaluation
                  <ArrowRight
                    weight="bold"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </MagneticWrap>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
