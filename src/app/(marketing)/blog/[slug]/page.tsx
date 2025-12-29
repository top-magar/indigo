import { notFound } from "next/navigation"
import { getPostBySlug, getAllPosts } from "@/lib/mdx"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { default: Content } = await import(`@/content/blog/${slug}.mdx`)

  return (
    <article className="container mx-auto max-w-3xl py-12 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.description && (
          <p className="mt-2 text-xl text-muted-foreground">{post.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          {post.date && <time>{post.date}</time>}
          {post.author && <span>by {post.author}</span>}
        </div>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <Content />
      </div>
    </article>
  )
}
