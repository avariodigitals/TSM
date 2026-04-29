import Image from "next/image";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import PageSection from "@/components/ui/PageSection";
import { getSettingValue } from "@/lib/site-settings";
import BlogRichText, { getExcerptFromBody } from "@/components/content/BlogRichText";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: Date | null) {
  if (!date) return "Recently updated";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const imagesBySlug = await getSettingValue<Record<string, string>>("content.imagesBySlug", {});

  let entry: {
    title: string;
    summary: string | null;
    body: string;
    publishedAt: Date | null;
    updatedAt: Date;
  } | null = null;

  try {
    entry = await prisma.contentEntry.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      select: {
        title: true,
        summary: true,
        body: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  } catch {
    return (
      <PageSection background="white" className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10">
          <h1 className="text-2xl font-black text-[#231F20] mb-2">Blog Temporarily Unavailable</h1>
          <p className="text-gray-600">We could not load this article right now. Please try again shortly.</p>
        </div>
      </PageSection>
    );
  }

  if (!entry) {
    notFound();
  }

  return (
    <>
      <PageSection background="light" className="pt-14 pb-10 lg:pt-20 lg:pb-12">
        <article className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-[#2E3192] mb-3">
            {formatDate(entry.publishedAt ?? entry.updatedAt)}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#231F20] mb-4">{entry.title}</h1>
          <p className="text-lg text-gray-600">{getExcerptFromBody(entry.summary || entry.body)}</p>
        </article>
      </PageSection>

      <PageSection background="white" className="pb-16 lg:pb-20">
        <article className="max-w-3xl mx-auto">
          {imagesBySlug[slug] ? (
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-gray-200 mb-8">
              <Image src={imagesBySlug[slug]} alt={entry.title} fill className="object-cover" sizes="100vw" />
            </div>
          ) : null}

          <BlogRichText markdown={entry.body} />
        </article>
      </PageSection>
    </>
  );
}
