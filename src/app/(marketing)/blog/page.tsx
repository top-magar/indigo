import Link from "next/link"
import { getAllPosts } from "@/lib/mdx"

export const metadata = {
  title: "Blog",
  description: "Latest news and updates from our platform",
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Latest news, updates, and insights from our team.
      </p>

      <div className="mt-8 space-y-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        ) : (
          posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-2 text-muted-foreground">{post.description}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  {post.date && <time>{post.date}</time>}
                  {post.author && <span>by {post.author}</span>}
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
