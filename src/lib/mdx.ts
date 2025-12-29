import fs from "fs"
import path from "path"

/**
 * MDX Utilities
 * 
 * Helper functions for working with MDX content.
 * Supports frontmatter-like metadata via exports in MDX files.
 * 
 * @see https://nextjs.org/docs/app/guides/mdx
 */

export interface PostMeta {
  slug: string
  title: string
  description?: string
  date?: string
  author?: string
  tags?: string[]
  published?: boolean
}

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog")

/**
 * Get all blog posts with their metadata
 */
export async function getAllPosts(): Promise<PostMeta[]> {
  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    return []
  }

  const files = fs.readdirSync(CONTENT_DIR)
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"))

  const posts: PostMeta[] = []

  for (const file of mdxFiles) {
    const slug = file.replace(/\.mdx$/, "")
    
    try {
      // Dynamic import to get exports from MDX file
      const mod = await import(`@/content/blog/${slug}.mdx`)
      const meta = mod.meta || {}

      // Only include published posts (or all if published is not set)
      if (meta.published === false) continue

      posts.push({
        slug,
        title: meta.title || slug,
        description: meta.description,
        date: meta.date,
        author: meta.author,
        tags: meta.tags,
        published: meta.published,
      })
    } catch (error) {
      console.error(`Error loading post ${slug}:`, error)
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<PostMeta | null> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const mod = await import(`@/content/blog/${slug}.mdx`)
    const meta = mod.meta || {}

    return {
      slug,
      title: meta.title || slug,
      description: meta.description,
      date: meta.date,
      author: meta.author,
      tags: meta.tags,
      published: meta.published,
    }
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error)
    return null
  }
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.tags?.includes(tag))
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts()
  const tags = new Set<string>()

  for (const post of posts) {
    if (post.tags) {
      for (const tag of post.tags) {
        tags.add(tag)
      }
    }
  }

  return Array.from(tags).sort()
}
