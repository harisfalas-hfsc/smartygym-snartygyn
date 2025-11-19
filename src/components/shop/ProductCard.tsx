import { ExternalLink, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
    amazon_url: string;
    image_url: string;
    price_range: string;
    is_featured: boolean;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.is_featured && (
            <Badge className="absolute top-2 left-2 z-10 bg-primary/90 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-2">
        <h3 className="text-lg font-semibold line-clamp-2 leading-tight">
          {product.title}
        </h3>
        <Badge variant="outline" className="mb-2 text-xs">
          {product.category}
        </Badge>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <p className="text-base font-bold text-primary pt-1">
          {product.price_range}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full"
          size="sm"
        >
          <a
            href={product.amazon_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-2"
          >
            View on Amazon
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};
