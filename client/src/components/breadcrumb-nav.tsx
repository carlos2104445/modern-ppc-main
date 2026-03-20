import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6" data-testid="breadcrumb-nav">
      <Link href="/admin/dashboard">
        <a
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="breadcrumb-home"
        >
          <Home className="h-4 w-4" />
          <span>Admin</span>
        </a>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && index !== items.length - 1 ? (
            <Link href={item.href}>
              <a
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </a>
            </Link>
          ) : (
            <span
              className="font-medium text-foreground"
              data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
