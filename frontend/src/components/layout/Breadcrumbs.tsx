import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-1.5 text-[12px] text-text-muted py-3 overflow-x-auto no-scrollbar ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
            {idx > 0 && <span className="text-text-muted/40">›</span>}
            {isLast || !item.href ? (
              <span className="text-text-primary font-medium truncate max-w-[200px]">{item.label}</span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-emerald-500 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
