import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";

export function BlogSection() {
  const section = sectionData.blog;
  const posts = section.posts.slice(0, 3);

  return (
    <section id="blog" className="lv2-section" aria-labelledby="blog-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={<>Guides for building a store<br />that sells</>}
          body={section.body}
          id="blog-title"
        />

        <div className="lv2-blog-grid">
          {posts.map((post) => (
            <Link key={post.id} href={post.href} className="lv2-article">
              <div className="lv2-article__thumb">
                <span aria-hidden style={{ fontSize: 24, fontWeight: 600 }}>{post.category.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="lv2-article__body">
                <div className="lv2-article__meta">
                  <b>{post.category}</b>
                  <span>{post.publishedAt}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <span className="lv2-article__cta">
                  Read Article <ArrowRight aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <a href={section.viewAll.href} className="lv2-btn lv2-btn--ghost">{section.viewAll.label}</a>
        </div>
      </div>
    </section>
  );
}
