import type { ReactNode } from "react";
import { ArrowLeft, Sigma } from "lucide-react";
import { Link } from "@tanstack/react-router";

type InformationPageLayoutProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function InformationPageLayout({
  icon,
  title,
  subtitle,
  children,
}: InformationPageLayoutProps) {
  return (
    <div dir="rtl" className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -right-36 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-36 -z-10 h-[30rem] w-[30rem] rounded-full bg-accent/80 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.035] via-background to-background" />

      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-5 flex items-center justify-between gap-3 px-1 sm:mb-7 sm:px-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-soft">
              <Sigma className="h-[18px] w-[18px]" strokeWidth={2.1} />
            </span>
            <span className="truncate text-sm font-semibold text-foreground sm:text-base">
              پروژه آنالیز عددی
            </span>
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            دانشگاه شاهد · پاییز ۱۴۰۵
          </span>
        </div>

        <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/95 shadow-[0_28px_90px_-28px_oklch(0.12_0.03_262_/_0.42)] backdrop-blur-xl sm:rounded-[2rem]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary/25 via-primary to-primary/60" />
          <div className="pointer-events-none absolute -left-24 -top-28 -z-10 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-24 -z-10 h-64 w-64 rounded-full bg-accent/65 blur-3xl" />

          <div className="relative px-5 pb-7 pt-9 sm:px-10 sm:pb-9 sm:pt-11">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-soft sm:h-16 sm:w-16">
              {icon}
            </div>

            <header className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
                {subtitle}
              </p>
            </header>

            <div className="mx-auto mt-7 w-full max-w-2xl sm:mt-8">{children}</div>

            <div className="mt-8 flex justify-center border-t border-border/70 pt-6 sm:mt-9">
              <Link
                to="/"
                className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl border border-border/90 bg-background/80 px-5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="h-4 w-4" />
                بازگشت
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-[11px] font-medium text-muted-foreground/80 sm:mt-6 sm:text-xs">
          پروژه درس آنالیز عددی (دکتر رحمانی) - پاییز ۱۴۰۵
        </p>
      </main>
    </div>
  );
}
