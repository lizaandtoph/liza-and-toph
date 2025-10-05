import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Brain, Hand, Heart, MessageCircle, BookOpen, Layers, Zap, Activity, Baby } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
}

const FILTER_CATEGORIES = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'cognitive', label: 'Cognitive', icon: Brain },
  { key: 'motor', label: 'Motor Skills', icon: Hand },
  { key: 'social-emotional', label: 'Social-Emotional', icon: Heart },
  { key: 'language', label: 'Language', icon: MessageCircle },
  { key: 'books', label: 'Books', icon: BookOpen }
];

export default function ProductGrid({ products }: ProductGridProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(product => product.categories?.includes(activeFilter) ?? false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cognitive': return 'bg-primary/10 text-primary';
      case 'motor': return 'bg-secondary/10 text-secondary';
      case 'language': return 'bg-accent/10 text-accent';
      case 'social-emotional': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getProductBadge = (product: Product) => {
    if (product.isTopPick) return { text: 'TOP PICK', className: 'bg-accent text-accent-foreground' };
    if (product.isBestseller) return { text: 'BESTSELLER', className: 'bg-secondary text-white' };
    if (product.isNew) return { text: 'NEW', className: 'bg-accent text-accent-foreground' };
    return null;
  };

  const getComplexityColor = (level: string | null | undefined) => {
    if (!level) return 'bg-gray-100 text-gray-700';
    switch (level) {
      case 'simple': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-blue-100 text-blue-700';
      case 'complex': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-orange-100 text-orange-700';
      case 'expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEnergyIcon = (requirement: string | null | undefined) => {
    if (!requirement) return null;
    switch (requirement) {
      case 'sedentary': return <Hand className="w-3 h-3" />;
      case 'moderate': return <Activity className="w-3 h-3" />;
      case 'active': return <Zap className="w-3 h-3" />;
      case 'high_energy': return <Zap className="w-3 h-3 fill-current" />;
      default: return null;
    }
  };

  const formatAgeRange = (minMonths: number | null | undefined, maxMonths: number | null | undefined) => {
    if (minMonths == null && maxMonths == null) return null;
    if (minMonths != null && maxMonths != null) {
      return `${minMonths}-${maxMonths} months`;
    }
    if (minMonths != null) return `${minMonths}+ months`;
    if (maxMonths != null) return `up to ${maxMonths} months`;
    return null;
  };

  return (
    <div>
      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {FILTER_CATEGORIES.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.key}
              onClick={() => setActiveFilter(category.key)}
              className={`filter-chip inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition shadow-sm ${
                activeFilter === category.key
                  ? 'active bg-primary text-primary-foreground'
                  : 'bg-card text-foreground border border-border hover:bg-primary hover:text-primary-foreground'
              }`}
              data-testid={`button-filter-${category.key}`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const badge = getProductBadge(product);
          const rating = parseFloat(product.rating);
          const fullStars = Math.floor(rating);
          const hasHalfStar = rating % 1 !== 0;
          
          return (
            <Card key={product.id} className="bg-card shadow-md overflow-hidden card-hover border border-border">
              <div className="relative">
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {badge && (
                  <div className={`absolute top-3 right-3 ${badge.className} text-xs font-bold px-2 py-1 rounded`}>
                    {badge.text}
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex items-center flex-wrap gap-1.5 mb-2">
                  {product.categories?.map(category => (
                    <Badge key={category} className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                  )) ?? null}
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Age Range, Play Types, Complexity */}
                <div className="space-y-2 mb-3">
                  {formatAgeRange(product.minAgeMonths, product.maxAgeMonths) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Baby className="w-3 h-3" />
                      <span>{formatAgeRange(product.minAgeMonths, product.maxAgeMonths)}</span>
                    </div>
                  )}
                  
                  {product.playTypeTags && product.playTypeTags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1">
                      {product.playTypeTags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                      {product.playTypeTags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{product.playTypeTags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.complexityLevel && (
                      <Badge className={`text-xs ${getComplexityColor(product.complexityLevel)}`}>
                        {product.complexityLevel}
                      </Badge>
                    )}
                    
                    {product.energyRequirement && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 flex items-center gap-1">
                        {getEnergyIcon(product.energyRequirement)}
                        <span>{product.energyRequirement.replace('_', ' ')}</span>
                      </Badge>
                    )}
                    
                    {product.specialNeedsSupport && product.specialNeedsSupport.length > 0 && (
                      <Badge className="text-xs bg-purple-100 text-purple-700">
                        ♿ {product.specialNeedsSupport.length} support(s)
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-1 text-accent mb-1">
                      {[...Array(fullStars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      {hasHalfStar && (
                        <div className="relative">
                          <Star className="w-3 h-3 text-accent" />
                          <Star className="w-3 h-3 fill-current text-accent absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                        </div>
                      )}
                      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
                        <Star key={`empty-${i}`} className="w-3 h-3 text-accent" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-heading font-bold text-foreground">{product.price}</p>
                  </div>
                </div>
                <Button 
                  className="w-full font-medium"
                  data-testid={`button-view-product-${product.id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <Button 
          variant="outline" 
          size="lg"
          className="px-8 py-3 font-heading font-semibold border-2"
          data-testid="button-load-more"
        >
          Load More Products
          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
