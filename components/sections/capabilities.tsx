import { Section, SectionHeading } from "@/components/section";
import { site } from "@/content/site";

export function Capabilities() {
  return (
    <Section id="capabilities">
      <SectionHeading title={site.sections.capabilities.title} />

      <div className="border-border border-t">
        {site.capabilities.map((group) => (
          <div
            key={group.group}
            className="reveal border-border grid gap-2 border-b py-6 sm:grid-cols-[14rem_1fr] sm:gap-10"
          >
            <h3 className="text-lg font-medium tracking-tight">
              {group.group}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
              {group.items.join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
