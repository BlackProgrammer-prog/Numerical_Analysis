import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Github, Users } from "lucide-react";
import { InformationPageLayout } from "@/components/information-page-layout";

type TeamMember = {
  name: string;
  role: string;
  initials: string;
  githubUrl: string;
};

// لینک GitHub هر عضو را در githubUrl همان شخص وارد کنید.
const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "پرهام عزیزی",
    role: "توسعه‌دهنده بک‌اند پروژه",
    initials: "پ‌ع",
    githubUrl: "",
  },
  {
    name: "علی زندی",
    role: "توسعه‌دهنده فیچرهای پروژه و فرانت‌اند",
    initials: "ع‌ز",
    githubUrl: "",
  },
  {
    name: "میثم محسنی",
    role: "توسعه‌دهنده الگوریتم‌های اجرایی پروژه",
    initials: "م‌م",
    githubUrl: "",
  },
  {
    name: "علیرضا رسولیان",
    role: "هماهنگ‌کننده پروژه و توسعه‌دهنده الگوریتم پروژه",
    initials: "ع‌ر",
    githubUrl: "",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره ما | آنالیز عددی" },
      {
        name: "description",
        content: "آشنایی با اعضای تیم پروژه آنالیز عددی دانشگاه شاهد.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <InformationPageLayout
      icon={<Users className="h-6 w-6" strokeWidth={1.9} />}
      title="درباره ما"
      subtitle="معرفی اعضای تیم توسعه‌دهنده پروژه"
    >
      <section className="text-center">
        <p className="mx-auto max-w-lg text-sm font-semibold leading-8 text-foreground sm:text-[15px]">
          کاری از بچه‌های علوم کامپیوتر دانشگاه شاهد
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <article
              key={member.name}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/75 px-4 py-5 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-pop sm:px-5 sm:py-6"
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary/10 text-sm font-bold text-primary shadow-soft transition-transform duration-200 group-hover:scale-105">
                {member.initials}
              </div>
              <h2 className="text-sm font-bold text-foreground sm:text-[15px]">
                {member.name}
              </h2>
              <p className="mx-auto mt-2 min-h-10 max-w-[16rem] text-xs leading-6 text-muted-foreground sm:text-[13px]">
                {member.role}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="font-medium text-muted-foreground">راه ارتباطی:</span>
                {member.githubUrl.trim() ? (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Github className="h-3.5 w-3.5" />
                    لینک GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border bg-secondary/55 px-3 py-1.5 font-medium text-muted-foreground"
                    title={`لینک GitHub ${member.name} را در فایل about.tsx وارد کنید`}
                  >
                    <Github className="h-3.5 w-3.5" />
                    لینک GitHub
                  </span>
                )}
              </div>
              <span className="sr-only">عضو شماره {index + 1}</span>
            </article>
          ))}
        </div>
      </section>
    </InformationPageLayout>
  );
}
