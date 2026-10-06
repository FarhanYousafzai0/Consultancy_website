import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ensureGuidesSeeded, getGuideBySlug } from "@/lib/db/guides";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  await ensureGuidesSeeded();
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide || guide.status !== "published") return { title: "Guide" };
  return {
    title: guide.title,
    description: guide.body.slice(0, 140),
  };
}

export default async function GuideDetailPage({ params }: Props) {
  await ensureGuidesSeeded();
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide || guide.status !== "published") notFound();

  const paragraphs = guide.body.split(/\n\n+/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/guides">
          <ArrowLeft />
          All guides
        </Link>
      </Button>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral" className="capitalize">
          {guide.topic.replace(/_/g, " ")}
        </Badge>
        {guide.lastVerifiedAt ? (
          <Badge variant="verified">Verified · {guide.lastVerifiedAt}</Badge>
        ) : null}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        {guide.title}
      </h1>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/85">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-4">
        <p className="text-sm font-semibold">Official source</p>
        <a
          href={guide.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-forest hover:underline"
        >
          {guide.sourceUrl}
          <ArrowSquareOut className="size-4" />
        </a>
      </div>
    </article>
  );
}
