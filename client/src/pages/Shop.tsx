import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import needsToProductsData from '../data/needsToProducts.json';

export default function Shop() {
  const { child } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allProducts = Object.values(needsToProductsData).flat();
  const uniqueProducts = Array.from(
    new Map(allProducts.map((p) => [p.skuId, p])).values()
  );

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'building', label: 'Building & Construction' },
    { value: 'dolls', label: 'Dolls & Pretend Play' },
    { value: 'art', label: 'Art & Creativity' },
    { value: 'books', label: 'Books & Stories' },
    { value: 'motor', label: 'Movement & Motor Skills' },
  ];

  const filteredProducts = uniqueProducts.filter((product) => {
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
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg opacity-70">No products found matching your criteria.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.skuId}
            className="bg-[#EDE9DC] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
            data-testid={`card-product-${product.skuId}`}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3 line-clamp-2" data-testid={`text-title-${product.skuId}`}>
                {product.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
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
              <p className="text-sm opacity-70 mb-4">
                Ages {product.ageMin}-{product.ageMax}
              </p>
              <button
                onClick={() => handleProductClick(product.skuId, product.url)}
                className="w-full px-4 py-3 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium"
                data-testid={`button-view-${product.skuId}`}
              >
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>

      {child.name && (
        <div className="mt-12 bg-gradient-to-r from-olive/10 to-blush/10 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for personalized recommendations?</h2>
          <p className="mb-6 opacity-80">
            View products specifically curated for {child.name}'s Play Board
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
