# Post enrichment guidelines (Short Answers, FAQ, meta description)

Every post on the Kidinjury Law Blog gets a small set of reader- and search-facing extras stored in
`src/data/enrichment/<slug>.json`. They are displayed around the post (Short Answer box at the top, FAQ at the
bottom, meta description in the page head) and emitted as structured data for search engines and AI answer engines.

**The post text itself is never changed.** These extras are built from the post's own words.

## The one rule that matters: stay in the post's wording

The author is a practicing Georgia attorney; everything shown under his name must be something he actually wrote.

- Build every Short Answer and FAQ answer **from sentences and phrases that appear in the post**, as close to
  verbatim as possible. You may: trim words, drop a clause, join two of the post's sentences, change a pronoun or
  tense so a fragment reads on its own, and replace "here"/"this post" with a neutral word.
- **Do not add facts, numbers, legal conclusions, advice, hedges or opinions that are not in the post.**
  No "consult an attorney", no "laws may have changed", no new statute citations, no softening or sharpening.
- Keep the author's voice and point of view (first person stays first person). Do not "neutralize" opinion posts.
- If the post doesn't contain a clean answer to something, leave it out rather than inventing one.
- Keep legal terms, statute numbers, dollar figures and names exactly as the post writes them.
- Plain text only (no HTML, no Markdown). Use straight ASCII apostrophes/quotes or the post's curly ones, either is fine.

## Fields

```json
{
  "slug": "post-slug",
  "description": "≤ 155 characters. Meta description: what the post covers, drawn from the post's opening or key sentence. One or two short sentences.",
  "shortAnswer": "2–3 sentences, ≤ 60 words. The post's core answer/point, quotable on its own, near-verbatim from the post.",
  "sections": [
    { "heading": "exact text of an <h2>/<h3> in the post", "shortAnswer": "1–2 sentences ≤ 45 words from that section" }
  ],
  "faq": [
    { "q": "A natural question a parent would type into Google or ask an AI assistant", "a": "1–3 sentences ≤ 60 words, near-verbatim from the post" }
  ]
}
```

- `sections`: only for posts that have `<h2>`/`<h3>` headings (a few do). Otherwise `[]`. Use each heading's exact text.
- `faq`: 2–4 entries when the post genuinely answers questions (most legal-explainer posts). 0–1 for news,
  announcements or personal posts. Questions should be specific ("Is a Georgia dog owner liable if their dog was
  off its leash?"), not generic. Answers must not repeat the Short Answer word for word; cover different points.
- `description`: must read naturally in a Google result. No clickbait. ≤ 155 characters including spaces.

## Self-check before saving

For every Short Answer and FAQ answer, you should be able to point to the sentence(s) in the post it came from.
If you had to write more than a few connecting words of your own, rewrite it closer to the source.
