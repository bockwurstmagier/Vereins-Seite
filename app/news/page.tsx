import { getPublishedNews } from "../../lib/public-content";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

export default async function NewsPage() {
  const items = await getPublishedNews(50);

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="club-eyebrow">
          Zurück zur Startseite
        </a>

        <h1 className="club-heading mt-4">Alle Vereinsnews</h1>

        <div className="mt-8 space-y-5">
          {items.map((item) => {
            const displayDate = item.published_at || item.created_at;

            return (
              <article key={item.id} className="club-card overflow-hidden">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-56 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <p className="club-eyebrow">{item.category}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {dateFormatter.format(new Date(displayDate))}
                  </p>
                  <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {item.excerpt || item.content}
                  </p>
                  <a
                    href={`/news/${item.slug}`}
                    className="club-button-primary mt-5"
                  >
                    Weiterlesen
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
