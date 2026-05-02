import { useMenu } from '../../shared/components/MenuContext';
import { SectionNav } from './SectionNav';
import { MenuItemCard } from './MenuItemCard';
import './MenuPage.css';

export function MenuPage() {
  const { data, loading, error } = useMenu();

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="menu-loading-spinner" />
        <p>Cargando carta...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="menu-error">
        <p>Error al cargar la carta</p>
        <p className="menu-error-detail">{error}</p>
      </div>
    );
  }

  const visibleSections = data.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div className="menu-header-ornament">✦ ✦ ✦</div>
        <h1 className="menu-header-title">{data.config.barName}</h1>
        <div className="menu-header-rule" />
        <p className="menu-header-subtitle">{data.config.subtitle}</p>
        <div className="menu-header-ornament">✦ ✦ ✦</div>
      </header>

      <SectionNav sections={visibleSections} />

      <main className="menu-content">
        {visibleSections.map((section) => (
          <section
            key={section.id}
            id={`section-${section.id}`}
            className="menu-section"
          >
            <div className="menu-section-header">
              <div className="menu-section-line" />
              <h2 className="menu-section-title">
                {section.name}
              </h2>
              <div className="menu-section-line" />
            </div>

            {section.hasDualPricing && (
              <div className="menu-dual-pricing-header">
                <span />
                <span className="menu-pricing-label">{section.priceLabelSmall}</span>
                <span className="menu-pricing-label">{section.priceLabelFull}</span>
              </div>
            )}

            <div className={section.hasDualPricing ? 'menu-items-list' : 'menu-items-grid'}>
              {section.items
                .filter((item) => item.available)
                .map((item, index) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    isDualPricing={section.hasDualPricing}
                    allergens={data.allergens}
                    index={index}
                  />
                ))}
            </div>
          </section>
        ))}

        <section className="menu-allergens">
          <div className="menu-section-header">
            <div className="menu-section-line" />
            <h2 className="menu-section-title">Alérgenos</h2>
            <div className="menu-section-line" />
          </div>
          <div className="allergen-grid">
            {data.allergens.map((a) => (
              <div key={a.id} className="allergen-badge-info">
                <span className="allergen-number">{a.id}</span>
                <span className="allergen-icon-large">{a.icon}</span>
                <span className="allergen-name">{a.name}</span>
              </div>
            ))}
          </div>
          {data.config.allergenNote && (
            <p className="allergen-note">{data.config.allergenNote}</p>
          )}
        </section>

        <footer className="menu-footer">
          {data.config.footerNote && (
            <p className="menu-footer-note">{data.config.footerNote}</p>
          )}
          <p className="menu-footer-thanks">¡Gracias por su visita!</p>
          <div className="menu-footer-ornament">✦ ✦ ✦</div>
        </footer>
      </main>
    </div>
  );
}
