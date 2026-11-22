import { useState } from "react";
import { ExternalLink, FileText, Github, Menu, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROJECT_REPOSITORY = "https://github.com/BlackProgrammer-prog/Numerical_Analysis";

export function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="باز کردن منوی اصلی"
          title="منوی اصلی"
          className="group relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border/80 bg-card text-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent hover:text-accent-foreground hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <Menu className="relative h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-105" strokeWidth={2.1} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={12}
        dir="rtl"
        className="w-64 rounded-2xl border-border/80 bg-card/95 p-2.5 shadow-pop backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 pb-2 pt-2 text-right">
          <span className="block text-sm font-bold text-foreground">دسترسی سریع</span>
          <span className="mt-1 block text-[11px] font-normal text-muted-foreground">
            پروژه آنالیز عددی
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          asChild
          className="min-h-12 cursor-pointer rounded-xl px-3 py-2.5 text-right focus:bg-accent focus:text-accent-foreground"
        >
          <Link to="/project-description">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-[17px] w-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">توضیح پروژه</span>
              <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                معرفی و اطلاعات کلی پروژه
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="min-h-12 cursor-pointer rounded-xl px-3 py-2.5 text-right focus:bg-accent focus:text-accent-foreground"
        >
          <a href={PROJECT_REPOSITORY} target="_blank" rel="noopener noreferrer">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
              <Github className="h-[17px] w-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">لینک پروژه</span>
              <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                مشاهده مخزن در GitHub
              </span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="min-h-12 cursor-pointer rounded-xl px-3 py-2.5 text-right focus:bg-accent focus:text-accent-foreground"
        >
          <Link to="/about">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-[17px] w-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">درباره ما</span>
              <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                آشنایی با اعضای تیم پروژه
              </span>
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
