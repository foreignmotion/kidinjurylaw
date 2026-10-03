// RSS feed at /feed/ — the same URL as the old WordPress feed, so existing subscribers keep working.
// Written to dist/feed/index.html (so /feed/ resolves on a static host); public/_headers serves it as RSS.
import rss from '@astrojs/rss';
import { getPosts, describe, SITE } from '../../lib/site';

export async function GET(context: { site: URL }) {
  const posts = await getPosts();
  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site,
    items: posts.slice(0, 20).map((post) => ({
      title: post.data.title,
      link: post.data.path,
      pubDate: post.data.date,
      description: describe(post),
      content: post.data.format === 'html' ? (post.body ?? '').replace(/(href|src)="\//g, `$1="${SITE.url}/`) : undefined,
      categories: post.data.categories,
    })),
    customData: '<language>en-us</language>',
  });
}
