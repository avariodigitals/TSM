import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import PageSection from "@/components/ui/PageSection";
import { getSettingValue } from "@/lib/site-settings";
import { getPageHeroContent } from "@/lib/page-content";
import { getExcerptFromBody, getFirstImageFromBody } from "@/components/content/BlogRichText";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return "Recently updated";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function BlogPage() {
  const imagesBySlug = await getSettingValue<Record<string, string>>("content.imagesBySlug", {});
  const blogHero = await getPageHeroContent("blog");

  let entries: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    publishedAt: Date | null;
    updatedAt: Date;
  }> = [];

  try {
    entries = await prisma.contentEntry.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        body: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  } catch {
    entries = [];
  }

  return (
    <>
      <PageSection background="light" className="pt-14 pb-14 lg:pt-20 lg:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
            <span className="text-[#00AEEF] text-sm font-semibold">Insights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#231F20] mb-4">{blogHero.title}</h1>
          <p className="text-gray-600 text-lg">{blogHero.subtitle}</p>
        </div>
      </PageSection>

      <PageSection background="white" className="pt-4 pb-16 lg:pt-8 lg:pb-20">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No published blog posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <Link href={`/blog/${entry.slug}`} className="block">
                  {imagesBySlug[entry.slug] || getFirstImageFromBody(entry.body) ? (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={imagesBySlug[entry.slug] || getFirstImageFromBody(entry.body) || "/placeholder.webp"}
                        alt={entry.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-[#eef6ff] to-[#f6fbff]" />
                  )}
                </Link>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2E3192] mb-2">
                    {formatDate(entry.publishedAt ?? entry.updatedAt)}
                  </p>
                  <h2 className="text-xl font-black text-[#231F20] leading-tight mb-2">
                    <Link href={`/blog/${entry.slug}`} className="hover:text-[#00AEEF] transition-colors">
                      {entry.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {getExcerptFromBody(entry.summary || entry.body, "Read the full article for more details.").slice(0, 180)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </PageSection>
    </>
  );
}
