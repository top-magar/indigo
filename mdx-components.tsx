import type { MDXComponents } from "mdx/types"
import Image, { type ImageProps } from "next/image"
import Link from "next/link"

/**
 * MDX Components Configuration
 * 
 * Define custom components to use in MDX files.
 * These components will be available globally in all MDX content.
 * 
 * @see https://nextjs.org/docs/app/guides/mdx
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default HTML elements with styled versions
    h1: ({ children }) => (
      <h1 className="mt-8 scroll-m-20 text-4xl font-bold tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 scroll-m-20 text-2xl font-semibold tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-4 scroll-m-20 text-xl font-semibold tracking-tight">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href || "#"}
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-l-4 border-primary/20 pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    hr: () => <hr className="my-8 border-muted" />,
    // Custom image component with Next.js Image optimization
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        className="rounded-lg"
        {...(props as ImageProps)}
        alt={props.alt || ""}
      />
    ),
    // Spread any additional components passed in
    ...components,
  }
}
