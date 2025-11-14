import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string; // If undefined, it's the current page
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps) => {
  return (
    <nav className="mb-4 sm:mb-6 animate-fade-in" aria-label="breadcrumb">
      <Breadcrumb>
        <BreadcrumbList className="text-sm sm:text-base">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href || "/"}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};
