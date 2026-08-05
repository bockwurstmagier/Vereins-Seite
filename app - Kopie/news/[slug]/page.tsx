import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("news")
    .select(
      "id, title, excerpt, content, category, image_url, published_at, created_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !item) {
    notFound();
  }

  const displayDate = item.published_at || item.created_at;

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <article className="mx-auto max-w-3xl">
        <a href="/news" className="club-eyebrow">
          Zurück zu allen News
        </a>

        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            className="mt-8 max-h-[520px] w-full rounded-[2rem] object-cover"
          />
        )}

        <p className="club-eyebrow mt-8">{item.category}</p>
        <p className="mt-2 text-sm text-zinc-500">
          {dateFormatter.format(new Date(displayDate))}
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
          {item.title}
        </h1>

        {item.excerpt && (
          <p className="mt-6 text-lg font-semibold leading-8 text-zinc-300">
            {item.excerpt}
          </p>
        )}

        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-zinc-300">
          {item.content}
        </div>
      </article>
    </main>
  );
}
