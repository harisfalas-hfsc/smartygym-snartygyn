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
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="p-0">
        <div className="relative">
          {product.is_featured && (
            <Badge className="absolute top-2 left-2 z-10 bg-primary">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-64 object-cover rounded-t-lg"
            loading="lazy"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6">
        <Badge variant="outline" className="mb-3">
          {product.category}
        </Badge>
        <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">
          {product.description}
        </p>
        <p className="text-lg font-bold text-primary">{product.price_range}</p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          asChild
          className="w-full"
          size="lg"
        >
          <a
            href={product.amazon_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-2"
          >
            View on Amazon
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};
