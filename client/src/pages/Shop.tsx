import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Product } from '@shared/schema';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';

export default function Shop() {
  const { getActiveChild } = useStore();
  const child = getActiveChild();
  const [location] = useLocation();
  
  // Get category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [showFilters, setShowFilters] = useState(false);
  
  // Update category when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'all';
    setSelectedCategory(category);
  }, [location]);
  
  // Filter states
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 60]);
  const [selectedPlayTypes, setSelectedPlayTypes] = useState<string[]>([]);
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string[]>([]);
  const [selectedSocialContext, setSelectedSocialContext] = useState<string[]>([]);
  const [lizaTophCertifiedOnly, setLizaTophCertifiedOnly] = useState(false);
  
  const playTypes = ['sensory', 'exploratory', 'functional', 'constructive', 'pretend', 'symbolic', 'gross_motor', 'fine_motor', 'cognitive', 'social', 'language', 'creative'];
  const complexityLevels = ['simple', 'moderate', 'complex', 'advanced', 'expert'];
  const energyRequirements = ['sedentary', 'moderate', 'active', 'high_energy'];
  const specialNeedsTypes = ['autism_friendly', 'sensory_processing', 'speech_therapy', 'motor_therapy'];
  const socialContexts = ['solo_play', 'paired_play', 'group_play', 'family_play'];

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

  const getProductBadge = (product: Product) => {
    if (product.isLizaTophCertified) return { text: 'LIZA & TOPH CERTIFIED', className: 'bg-purple-600 text-white' };
    if (product.isTopPick) return { text: 'TOP PICK', className: 'bg-accent text-accent-foreground' };
    if (product.isBestseller) return { text: 'BESTSELLER', className: 'bg-secondary text-white' };
    if (product.isNew) return { text: 'NEW', className: 'bg-accent text-accent-foreground' };
    return null;
  };

  const filteredProducts = products.filter((product) => {
    // Search and category (always applied)
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (product.categories?.some(d => d.toLowerCase().includes(selectedCategory)) ?? false);
    
    // Advanced filters (only applied when explicitly set)
    // Age range filter - only apply if user has changed from default [0, 60]
    const hasAgeFilter = ageRange[0] !== 0 || ageRange[1] !== 60;
    const matchesAge = !hasAgeFilter || (
      (product.maxAgeMonths == null || product.maxAgeMonths >= ageRange[0]) &&
      (product.minAgeMonths == null || product.minAgeMonths <= ageRange[1])
    );
    
    // Play types filter
    const matchesPlayType = selectedPlayTypes.length === 0 || 
      (product.playTypeTags?.some(tag => selectedPlayTypes.includes(tag)) ?? false);
    
    // Complexity filter
    const matchesComplexity = !selectedComplexity || product.complexityLevel === selectedComplexity;
    
    // Energy filter
    const matchesEnergy = !selectedEnergy || product.energyRequirement === selectedEnergy;
    
    // Special needs filter
    const matchesSpecialNeeds = selectedSpecialNeeds.length === 0 ||
      (product.specialNeedsSupport?.some(need => selectedSpecialNeeds.includes(need)) ?? false);
    
    // Social context filter
    const matchesSocialContext = selectedSocialContext.length === 0 ||
      (product.socialContext?.some(ctx => selectedSocialContext.includes(ctx)) ?? false);
    
    // Liza & Toph Certified filter
    const matchesLizaTophCertified = !lizaTophCertifiedOnly || product.isLizaTophCertified === true;
    
    return matchesSearch && matchesCategory && matchesAge && matchesPlayType && 
           matchesComplexity && matchesEnergy && matchesSpecialNeeds && matchesSocialContext &&
           matchesLizaTophCertified;
  });
  
  const clearFilters = () => {
    setAgeRange([0, 60]);
    setSelectedPlayTypes([]);
    setSelectedComplexity(null);
    setSelectedEnergy(null);
    setSelectedSpecialNeeds([]);
    setSelectedSocialContext([]);
    setSelectedCategory('all');
    setLizaTophCertifiedOnly(false);
  };
  
  const activeFilterCount = 
    (ageRange[0] !== 0 || ageRange[1] !== 60 ? 1 : 0) +
    selectedPlayTypes.length +
    (selectedComplexity ? 1 : 0) +
    (selectedEnergy ? 1 : 0) +
    selectedSpecialNeeds.length +
    selectedSocialContext.length +
    (selectedCategory !== 'all' ? 1 : 0) +
    (lizaTophCertifiedOnly ? 1 : 0);

  const handleProductClick = (skuId: string, url: string) => {
    logEvent('shop_product_clicked', { sku: skuId });
    
    // Prevent redirect loop for invalid URLs
    if (!url || url === '#' || url.trim() === '') {
      alert('Product link not available. Please check back later.');
      return;
    }
    
    const encodedUrl = encodeURIComponent(url);
    window.open(`/api/links?sku=${skuId}&to=${encodedUrl}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-shop-title">Shop Curated Products</h1>
        <p className="text-lg opacity-80 mb-2">
          Discover toys, books, and materials carefully selected for developmental play.
        </p>
        <p className="text-sm opacity-60">
          As we develop the market place, product links below may be affiliate links from platforms such as Amazon. As affiliates, we earn from qualifying purchases.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#EDE9DC] p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
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
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1">{activeFilterCount}</Badge>
              )}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t border-sand pt-4 mt-4 space-y-6">
            {/* Age Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-semibold text-sm text-espresso">Age Range</label>
                <span className="text-sm font-medium text-olive bg-olive/10 px-3 py-1 rounded-full">
                  {ageRange[0] >= 12 ? `${Math.floor(ageRange[0] / 12)}y` : `${ageRange[0]}m`} - {ageRange[1] >= 12 ? `${Math.floor(ageRange[1] / 12)}y` : `${ageRange[1]}m`}
                </span>
              </div>
              <Slider
                value={ageRange}
                onValueChange={(value) => setAgeRange(value as [number, number])}
                min={0}
                max={72}
                step={6}
                className="w-full"
                data-testid="slider-age-range"
              />
            </div>
            
            {/* Play Types */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Play Types</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playTypes.map(type => (
                  <div key={type} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      id={`playtype-${type}`}
                      checked={selectedPlayTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlayTypes([...selectedPlayTypes, type]);
                        } else {
                          setSelectedPlayTypes(selectedPlayTypes.filter(t => t !== type));
                        }
                      }}
                      className="h-5 w-5"
                      data-testid={`checkbox-playtype-${type}`}
                    />
                    <label htmlFor={`playtype-${type}`} className="text-sm capitalize cursor-pointer">{type.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Complexity Level */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Complexity Level</label>
              <div className="flex flex-wrap gap-2">
                {complexityLevels.map(level => (
                  <Badge
                    key={level}
                    variant={selectedComplexity === level ? "default" : "outline"}
                    className="cursor-pointer capitalize px-4 py-2 text-sm hover:bg-olive/10 transition-colors"
                    onClick={() => setSelectedComplexity(selectedComplexity === level ? null : level)}
                    data-testid={`badge-complexity-${level}`}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Energy Requirement */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Energy Requirement</label>
              <div className="flex flex-wrap gap-2">
                {energyRequirements.map(energy => (
                  <Badge
                    key={energy}
                    variant={selectedEnergy === energy ? "default" : "outline"}
                    className="cursor-pointer capitalize px-4 py-2 text-sm hover:bg-olive/10 transition-colors"
                    onClick={() => setSelectedEnergy(selectedEnergy === energy ? null : energy)}
                    data-testid={`badge-energy-${energy}`}
                  >
                    {energy.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Special Needs Support */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Special Needs Support</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialNeedsTypes.map(need => (
                  <div key={need} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      id={`specialneeds-${need}`}
                      checked={selectedSpecialNeeds.includes(need)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSpecialNeeds([...selectedSpecialNeeds, need]);
                        } else {
                          setSelectedSpecialNeeds(selectedSpecialNeeds.filter(n => n !== need));
                        }
                      }}
                      className="h-5 w-5"
                      data-testid={`checkbox-specialneeds-${need}`}
                    />
                    <label htmlFor={`specialneeds-${need}`} className="text-sm capitalize cursor-pointer">{need.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Social Context */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Social Context</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {socialContexts.map(context => (
                  <div key={context} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      id={`socialcontext-${context}`}
                      checked={selectedSocialContext.includes(context)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSocialContext([...selectedSocialContext, context]);
                        } else {
                          setSelectedSocialContext(selectedSocialContext.filter(c => c !== context));
                        }
                      }}
                      className="h-5 w-5"
                      data-testid={`checkbox-socialcontext-${context}`}
                    />
                    <label htmlFor={`socialcontext-${context}`} className="text-sm capitalize cursor-pointer">{context.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Liza and Toph Certified */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Liza and Toph Certified</label>
              <div className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  id="liza-toph-certified"
                  checked={lizaTophCertifiedOnly}
                  onCheckedChange={(checked) => setLizaTophCertifiedOnly(checked as boolean)}
                  className="h-5 w-5"
                  data-testid="checkbox-liza-toph-certified"
                />
                <label htmlFor="liza-toph-certified" className="text-sm cursor-pointer">Show only Liza and Toph Certified products</label>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
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
        {filteredProducts.map((product) => {
          const badge = getProductBadge(product);
          return (
            <div
              key={product.id}
              className="bg-[#EDE9DC] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              data-testid={`card-product-${product.id}`}
            >
              <div className="aspect-square bg-ivory overflow-hidden relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  data-testid={`img-product-${product.id}`}
                />
                {badge && (
                  <div className={`absolute top-3 right-3 ${badge.className} text-xs font-bold px-2 py-1 rounded`} data-testid={`badge-${product.id}`}>
                    {badge.text}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 line-clamp-2 min-h-[3.5rem]" data-testid={`text-title-${product.id}`}>
                  {product.name}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  {product.categories?.slice(0, 2).map((category, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-sand text-espresso text-xs rounded"
                      data-testid={`tag-category-${idx}`}
                    >
                      {category}
                    </span>
                  )) ?? null}
                </div>
                
                {product.ageRange && (
                  <p className="text-xs opacity-70 mb-3">
                    Ages {product.ageRange}
                  </p>
                )}

                <button
                  onClick={() => handleProductClick(product.id, product.affiliateUrl || '#')}
                  className="w-full px-4 py-2 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium text-sm"
                  data-testid={`button-view-${product.id}`}
                >
                  View Product
                </button>
              </div>
            </div>
          );
        })}
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
