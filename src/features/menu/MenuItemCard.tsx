import type { MenuItem, Allergen } from '../../shared/types';

interface MenuItemCardProps {
  item: MenuItem;
  isDualPricing?: boolean;
  allergens: Allergen[];
  index: number;
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €';
}

export function MenuItemCard({
  item,
  isDualPricing,
  allergens,
  index,
}: MenuItemCardProps) {
  const itemAllergens = (item.allergens || [])
    .map((id) => allergens.find((a) => a.id === id))
    .filter(Boolean);

  if (isDualPricing) {
    return (
      <div
        className="menu-item-row"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="menu-item-name-col">
          <span className="menu-item-name">{item.name}</span>
          {itemAllergens.length > 0 && (
            <span className="menu-item-allergens">
              ({itemAllergens.map((a) => a!.id).join(', ')})
            </span>
          )}
          {item.description && (
            <span className="menu-item-desc">{item.description}</span>
          )}
        </div>
        <span className="menu-item-price">
          {item.priceHalf != null ? formatPrice(item.priceHalf) : '—'}
        </span>
        <span className="menu-item-price">
          {item.priceFull != null ? formatPrice(item.priceFull) : '—'}
        </span>
      </div>
    );
  }

  return (
    <div
      className="menu-item-card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="menu-item-card-content">
        <div className="menu-item-card-info">
          <span className="menu-item-name">{item.name}</span>
          {item.description && (
            <span className="menu-item-desc">{item.description}</span>
          )}
          {itemAllergens.length > 0 && (
            <div className="menu-item-allergen-badges">
              {itemAllergens.map((a) => (
                <span
                  key={a!.id}
                  className="allergen-badge"
                  title={a!.name}
                >
                  {a!.id}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="menu-item-card-price">
          {item.price != null ? formatPrice(item.price) : formatPrice(item.priceFull!)}
        </span>
      </div>
    </div>
  );
}
