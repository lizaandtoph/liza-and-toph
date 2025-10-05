import { useState } from 'react';
import { Search, Filter, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Product } from '@shared/schema';
import { useStore } from '../store';
import { logEvent } from '../analytics';

export default function Shop() {
  const { getActiveChild } = useStore();
  const child = getActiveChild();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const parseAgeRange = (ageRange: string) => {
    const cleanRange = ageRange.replace(/\s*(months?|years?)\s*/gi, '').trim();
    const match = cleanRange.match(/(\d+)-(\d+)/);
    if (match) {
      return { ageMin: parseInt(match[1]), ageMax: parseInt(match[2]) };
    }
    const singleMatch = cleanRange.match(/(\d+)/);
    if (singleMatch) {
      const age = parseInt(singleMatch[1]);
      return { ageMin: age, ageMax: age };
    }
    return { ageMin: 0, ageMax: 24 };
  };

  const transformedProducts = products.map((p) => {
    const { ageMin, ageMax } = parseAgeRange(p.ageRange);
    return {
      skuId: p.id,
      title: p.name,
      url: p.affiliateUrl || '#',
      ageMin,
      ageMax,
      domains: p.categories || [],
      price: p.price,
      rating: parseFloat(p.rating) || 5.0,
      reviewCount: p.reviewCount,
      imageUrl: p.imageUrl,
    };
  });

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'building', label: 'Building & Construction' },
    { value: 'dolls', label: 'Dolls & Pretend Play' },
    { value: 'art', label: 'Art & Creativity' },
    { value: 'books', label: 'Books & Stories' },
    { value: 'motor', label: 'Movement & Motor Skills' },
  ];

  const filteredProducts = transformedProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      product.domains.some(d => d.toLowerCase().includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (skuId: string, url: string) => {
    logEvent('shop_product_clicked', { sku: skuId });
    const encodedUrl = encodeURIComponent(url);
    window.open(`/api/links?sku=${skuId}&to=${encodedUrl}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-shop-title">Shop Curated Products</h1>
        <p className="text-lg opacity-80">
          Discover toys, books, and materials carefully selected for developmental play
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#EDE9DC] p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-espresso/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-ivory border-2 border-sand rounded-lg focus:border-olive focus:outline-none"
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-espresso/50" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-ivory border-2 border-sand rounded-lg focus:border-olive focus:outline-none"
              data-testid="select-category"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg opacity-70">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg opacity-70">No products found matching your criteria.</p>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.skuId}
            className="bg-[#EDE9DC] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
            data-testid={`card-product-${product.skuId}`}
          >
            <div className="aspect-square bg-ivory overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                data-testid={`img-product-${product.skuId}`}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem]" data-testid={`text-title-${product.skuId}`}>
                {product.title}
              </h3>
              
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-ochre text-ochre" />
                <span className="font-semibold text-sm" data-testid={`text-rating-${product.skuId}`}>
                  {product.rating}
                </span>
                <span className="text-xs opacity-60" data-testid={`text-reviews-${product.skuId}`}>
                  ({product.reviewCount})
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {product.domains.slice(0, 2).map((domain, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-sand text-espresso text-xs rounded"
                    data-testid={`tag-domain-${idx}`}
                  >
                    {domain}
                  </span>
                ))}
              </div>
              
              <p className="text-xs opacity-70 mb-3">
                Ages {product.ageMin}-{product.ageMax}
              </p>

              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold text-olive" data-testid={`text-price-${product.skuId}`}>
                  {product.price}
                </span>
                <button
                  onClick={() => handleProductClick(product.skuId, product.url)}
                  className="px-4 py-2 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium text-sm"
                  data-testid={`button-view-${product.skuId}`}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {child?.name && (
        <div className="mt-12 bg-gradient-to-r from-olive/10 to-blush/10 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for personalized recommendations?</h2>
          <p className="mb-6 opacity-80">
            View products specifically curated for {child?.name}'s Play Board
          </p>
          <a
            href="/recommendations"
            className="inline-block px-6 py-3 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium"
            data-testid="button-view-recommendations"
          >
            View My Recommendations
          </a>
        </div>
      )}
    </div>
  );
}
