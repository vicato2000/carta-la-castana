import { useState, useEffect, useCallback } from 'react';
import type { Section } from '../../shared/types';

interface SectionNavProps {
  sections: Section[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topEntry = visible.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top
              ? curr
              : prev
          );
          const id = topEntry.target.id.replace('section-', '');
          setActiveId(id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="section-nav">
      <div className="section-nav-inner">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`section-nav-btn ${
              activeId === section.id ? 'active' : ''
            }`}
            onClick={() => handleClick(section.id)}
          >
            <span className="section-nav-icon">{section.icon}</span>
            <span className="section-nav-label">{section.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
