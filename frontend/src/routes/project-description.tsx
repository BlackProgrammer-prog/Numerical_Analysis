import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText } from "lucide-react";
import { InformationPageLayout } from "@/components/information-page-layout";

export const Route = createFileRoute("/project-description")({
  head: () => ({
    meta: [
      { title: "توضیح پروژه | آنالیز عددی" },
      {
        name: "description",
        content: "توضیحات و اطلاعات مربوط به پروژه درس آنالیز عددی دانشگاه شاهد.",
      },
    ],
  }),
  component: ProjectDescriptionPage,
});

function ProjectDescriptionPage() {
  return (
    <InformationPageLayout
      icon={<BookOpenText className="h-6 w-6" strokeWidth={1.9} />}
      title="توضیح پروژه"
      subtitle="اطلاعات و توضیحات مربوط به پروژه آنالیز عددی"
    >
      <section className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-secondary/35 px-5 py-10 text-center shadow-inner sm:min-h-[290px] sm:rounded-3xl sm:px-8">
        <div className="max-w-lg">
          <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-primary/15 bg-background/80 text-primary shadow-soft">
            <BookOpenText className="h-5 w-5" />
          </span>
          {/* متن نهایی توضیحات پروژه را در این بخش قرار دهید. */}
          <p className="text-sm leading-8 text-muted-foreground sm:text-[15px]">
            محل قرارگیری توضیحات پروژه
          </p>
        </div>
      </section>
    </InformationPageLayout>
  );
}
