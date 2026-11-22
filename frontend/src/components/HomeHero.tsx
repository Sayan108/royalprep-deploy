import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { HeroContent } from '../models/hero'

export function HomeHero({ content, children, preview = false }: { content: HeroContent; children?: ReactNode; preview?: boolean }) {
  const preventNavigation = preview ? (event: React.MouseEvent) => event.preventDefault() : undefined
  return <section className="home-hero">
    <div className="home-wrap home-hero-inner">
      <div>
        {content.eyebrow && <p className="home-eyebrow">{content.eyebrow}</p>}
        <h1>{content.headline}{content.highlight && <> <em>{content.highlight}</em></>}</h1>
        <p className="home-description">{content.description}</p>
        <div className="home-actions">
          <Link className="home-button home-primary" to={content.primaryPath || '/'} onClick={preventNavigation}>{content.primaryLabel} <span aria-hidden="true">→</span></Link>
          <Link className="home-text-link" to={content.secondaryPath || '/'} onClick={preventNavigation}>{content.secondaryLabel} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      {children && <div className="home-index">{children}</div>}
    </div>
  </section>
}
