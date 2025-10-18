import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X, Heart, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Product } from '@shared/schema';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import { formatAgeRange } from '@shared/ageUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { parseNaturalLanguageQuery } from '@/lib/nlpParser';

export default function Shop() {
  const { getActiveChild, savedItems, addSavedItem, removeSavedItem } = useStore();
  const child = getActiveChild();
  const [location] = useLocation();
  
  // Get category and age from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category') || 'all';
  const ageFromUrl = urlParams.get('age') || null;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [showFilters, setShowFilters] = useState(false);
  
  // Update category and age when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'all';
    const age = params.get('age') || null;
    setSelectedCategory(category);
    setSelectedAgeBracket(age);
  }, [location]);
  
  // Filter states
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<string | null>(ageFromUrl);
  const [selectedPlayTypes, setSelectedPlayTypes] = useState<string[]>([]);
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string[]>([]);
  const [selectedSocialContext, setSelectedSocialContext] = useState<string[]>([]);
  const [lizaTophCertifiedOnly, setLizaTophCertifiedOnly] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  const ageRangeCategories = [
    'Newborn to 18 months',
    '18 months to 3 years',
    '2 to 5 years',
    '3 to 6 years',
    '4 to 7 years',
    '5 to 8 years',
    '6 to 9 years',
    '7 to 10 years',
    '8 to 11 years',
    '9 to 12 years',
    '10 to Early Teens',
    'Preteens to Older Teens',
  ];
  
  const playTypes = ['active_play', 'art_supplies', 'building_toys', 'construction', 'crafts', 'group_games', 'imagination', 'logic_games', 'pretend_play', 'puzzles', 'sensory_toys', 'social_interaction', 'sports', 'textures'];
  const complexityLevels = ['simple', 'moderate', 'complex', 'advanced'];
  const energyRequirements = ['sedentary', 'moderate', 'active', 'high_energy'];
  const specialNeedsTypes = ['sensory_processing', 'speech_therapy', 'motor_therapy'];
  const socialContexts = ['solo_play', 'paired_play', 'group_play', 'family_play'];
  
  // User-friendly labels for filter options
  const playTypeLabels: Record<string, string> = {
    'active_play': 'Active Play',
    'art_supplies': 'Art Supplies',
    'building_toys': 'Building Toys',
    'construction': 'Construction',
    'crafts': 'Crafts',
    'group_games': 'Group Games',
    'imagination': 'Imagination',
    'logic_games': 'Logic Games',
    'pretend_play': 'Pretend Play',
    'puzzles': 'Puzzles',
    'sensory_toys': 'Sensory Toys',
    'social_interaction': 'Social Interaction',
    'sports': 'Sports',
    'textures': 'Textures'
  };
  
  const complexityLabels: Record<string, string> = {
    'simple': 'Simple',
    'moderate': 'Moderate',
    'complex': 'Complex',
    'advanced': 'Advanced'
  };
  
  const energyLabels: Record<string, string> = {
    'sedentary': 'Sedentary',
    'moderate': 'Moderate Energy',
    'active': 'Active',
    'high_energy': 'High Energy'
  };
  
  const specialNeedsLabels: Record<string, string> = {
    'sensory_processing': 'Sensory Processing',
    'speech_therapy': 'Speech Therapy',
    'motor_therapy': 'Motor Therapy'
  };
  
  const socialContextLabels: Record<string, string> = {
    'solo_play': 'Solo Play',
    'paired_play': 'Paired Play',
    'group_play': 'Group Play',
    'family_play': 'Family Play'
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const parseAgeRange = (ageRange: string | null | undefined) => {
    if (!ageRange) {
      return { ageMin: 0, ageMax: 24 };
    }
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

  const normalizeCategories = (categories: any): string[] => {
    if (Array.isArray(categories)) return categories;
    if (typeof categories === 'string') {
      // Handle PostgreSQL array format: {"item1","item2","item3"}
      if (categories.startsWith('{') && categories.endsWith('}')) {
        return categories
          .slice(1, -1) // Remove curly braces
          .split(',')
          .map(c => c.replace(/^"(.*)"$/, '$1').trim()) // Remove quotes and trim
          .filter(Boolean);
      }
      // Handle comma-separated string
      return categories.split(',').map(c => c.trim()).filter(Boolean);
    }
    return [];
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
    const categories = normalizeCategories(product.categories);
    const matchesCategory = selectedCategory === 'all' || 
      categories.some(d => d.toLowerCase().includes(selectedCategory));
    
    // Advanced filters (only applied when explicitly set)
    // Age range category filter
    const matchesAge = !selectedAgeBracket || product.ageRangeCategory === selectedAgeBracket;
    
    // Play types filter
    const matchesPlayType = selectedPlayTypes.length === 0 || (() => {
      const tags = normalizeCategories(product.playTypeTags);
      return tags.some(tag => selectedPlayTypes.includes(tag));
    })();
    
    // Complexity filter
    const matchesComplexity = !selectedComplexity || product.complexityLevel === selectedComplexity;
    
    // Energy filter
    const matchesEnergy = !selectedEnergy || product.energyRequirement === selectedEnergy;
    
    // Special needs filter
    const matchesSpecialNeeds = selectedSpecialNeeds.length === 0 || (() => {
      const support = normalizeCategories(product.specialNeedsSupport);
      return support.some(need => selectedSpecialNeeds.includes(need));
    })();
    
    // Social context filter
    const matchesSocialContext = selectedSocialContext.length === 0 || (() => {
      const contexts = normalizeCategories(product.socialContext);
      return contexts.some(ctx => selectedSocialContext.includes(ctx));
    })();
    
    // Liza & Toph Certified filter
    const matchesLizaTophCertified = !lizaTophCertifiedOnly || product.isLizaTophCertified === true;
    
    return matchesSearch && matchesCategory && matchesAge && matchesPlayType && 
           matchesComplexity && matchesEnergy && matchesSpecialNeeds && matchesSocialContext &&
           matchesLizaTophCertified;
  });
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAgeBracket, selectedPlayTypes, selectedComplexity, selectedEnergy, selectedSpecialNeeds, selectedSocialContext, lizaTophCertifiedOnly]);
  
  const clearFilters = () => {
    setSelectedAgeBracket(null);
    setSelectedPlayTypes([]);
    setSelectedComplexity(null);
    setSelectedEnergy(null);
    setSelectedSpecialNeeds([]);
    setSelectedSocialContext([]);
    setSelectedCategory('all');
    setLizaTophCertifiedOnly(false);
  };
  
  const activeFilterCount = 
    (selectedAgeBracket ? 1 : 0) +
    selectedPlayTypes.length +
    (selectedComplexity ? 1 : 0) +
    (selectedEnergy ? 1 : 0) +
    selectedSpecialNeeds.length +
    selectedSocialContext.length +
    (selectedCategory !== 'all' ? 1 : 0) +
    (lizaTophCertifiedOnly ? 1 : 0);
  
  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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

  const handleSaveProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering product click
    
    const isSaved = savedItems.products.includes(product.name);
    
    if (isSaved) {
      removeSavedItem('products', product.name);
    } else {
      addSavedItem('products', product.name);
      // Auto-save brand if not already saved
      if (product.brand && !savedItems.brands.includes(product.brand)) {
        addSavedItem('brands', product.brand);
      }
    }
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

      {/* Natural Language Search */}
      <div className="mb-8 bg-gradient-to-r from-olive/10 to-ochre/10 p-6 rounded-xl border-2 border-olive/20">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-olive mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-olive mb-2">Try Smart Search</h2>
            <p className="text-sm text-espresso/70 mb-4">
              Describe what you're looking for in plain language. Try: "7-year-old who loves building" or "toddler into sensory play"
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nlQuery.trim()) {
                    const parsed = parseNaturalLanguageQuery(nlQuery);
                    if (parsed.hasResults) {
                      // Apply filters
                      if (parsed.ageRange) {
                        setSelectedAgeBracket(parsed.ageRange);
                      }
                      if (parsed.categories.length > 0) {
                        setSelectedCategory(parsed.categories[0]);
                      }
                      if (parsed.playTypes.length > 0) {
                        setSelectedPlayTypes(parsed.playTypes);
                      }
                      setShowFilters(true);
                      setCurrentPage(1);
                    }
                  }
                }}
                placeholder="e.g., 5-year-old who loves puzzles and building things"
                className="flex-1 px-4 py-3 bg-white border-2 border-olive/30 rounded-lg focus:border-olive focus:outline-none text-espresso placeholder:text-espresso/40"
                data-testid="input-nl-search"
              />
              <Button
                onClick={() => {
                  if (nlQuery.trim()) {
                    const parsed = parseNaturalLanguageQuery(nlQuery);
                    if (parsed.hasResults) {
                      // Apply filters
                      if (parsed.ageRange) {
                        setSelectedAgeBracket(parsed.ageRange);
                      }
                      if (parsed.categories.length > 0) {
                        setSelectedCategory(parsed.categories[0]);
                      }
                      if (parsed.playTypes.length > 0) {
                        setSelectedPlayTypes(parsed.playTypes);
                      }
                      setShowFilters(true);
                      setCurrentPage(1);
                    }
                  }
                }}
                disabled={!nlQuery.trim()}
                className="bg-olive text-ivory hover:bg-ochre px-6 py-3 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-nl-search"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-olive mb-4 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedCategory('sensory')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'sensory' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-sensory"
          >
            Sensory & Exploratory
          </button>
          <button
            onClick={() => setSelectedCategory('fine motor')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'fine motor' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-fine-motor"
          >
            Fine Motor
          </button>
          <button
            onClick={() => setSelectedCategory('gross motor')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'gross motor' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-gross-motor"
          >
            Gross Motor
          </button>
          <button
            onClick={() => setSelectedCategory('cognitive')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'cognitive' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-cognitive"
          >
            Cognitive & Problem-Solving
          </button>
          <button
            onClick={() => setSelectedCategory('language')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'language' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-language"
          >
            Language & Communication
          </button>
          <button
            onClick={() => setSelectedCategory('social')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'social' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-social-emotional"
          >
            Social-Emotional
          </button>
          <button
            onClick={() => setSelectedCategory('pretend')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'pretend' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-imaginative"
          >
            Imaginative & Pretend
          </button>
          <button
            onClick={() => setSelectedCategory('building')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'building' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-construction"
          >
            Construction & Building
          </button>
          <button
            onClick={() => setSelectedCategory('stem')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'stem' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-stem"
          >
            Science & Discovery (STEM)
          </button>
          <button
            onClick={() => setSelectedCategory('art')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'art' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-creative-arts"
          >
            Creative Arts
          </button>
          <button
            onClick={() => setSelectedCategory('music')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'music' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-music"
          >
            Music & Movement
          </button>
          <button
            onClick={() => setSelectedCategory('games')}
            className={`px-4 py-3 border-2 rounded-xl transition text-center font-medium text-sm ${selectedCategory === 'games' ? 'bg-olive text-ivory border-olive' : 'bg-white border-sand hover:bg-olive hover:text-ivory hover:border-olive'}`}
            data-testid="button-category-games"
          >
            Games & Structured Play
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#EDE9DC] p-6 rounded-lg mb-8">
        <div className="flex flex-col gap-4 mb-4">
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-ivory border-2 border-sand rounded-lg focus:border-olive focus:outline-none md:w-auto"
              data-testid="select-category"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-olive text-ivory hover:bg-ochre px-6 py-3 font-semibold shadow-md w-full"
            data-testid="button-toggle-filters"
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 bg-ivory text-olive">{activeFilterCount}</Badge>
            )}
            {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t border-sand pt-4 mt-4 space-y-6">
            {/* Age Range Categories */}
            <div>
              <label className="font-semibold text-sm mb-3 block text-espresso">Age Range</label>
              <div className="flex flex-wrap gap-2">
                {ageRangeCategories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedAgeBracket === category ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-colors ${selectedAgeBracket === category ? 'bg-olive text-white border-olive shadow-md font-semibold' : 'bg-[#dedacc] hover:bg-olive/20 border-espresso/20'}`}
                    onClick={() => setSelectedAgeBracket(selectedAgeBracket === category ? null : category)}
                    data-testid={`badge-age-${category.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
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
                    <label htmlFor={`playtype-${type}`} className="text-sm cursor-pointer">{playTypeLabels[type] || type}</label>
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
                    className={`cursor-pointer capitalize px-4 py-2 text-sm transition-colors ${selectedComplexity === level ? 'bg-olive text-white border-olive shadow-md font-semibold' : 'bg-[#dedacc] hover:bg-olive/20 border-espresso/20'}`}
                    onClick={() => setSelectedComplexity(selectedComplexity === level ? null : level)}
                    data-testid={`badge-complexity-${level}`}
                  >
                    {complexityLabels[level] || level}
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
                    className={`cursor-pointer capitalize px-4 py-2 text-sm transition-colors ${selectedEnergy === energy ? 'bg-olive text-white border-olive shadow-md font-semibold' : 'bg-[#dedacc] hover:bg-olive/20 border-espresso/20'}`}
                    onClick={() => setSelectedEnergy(selectedEnergy === energy ? null : energy)}
                    data-testid={`badge-energy-${energy}`}
                  >
                    {energyLabels[energy] || energy}
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
                    <label htmlFor={`specialneeds-${need}`} className="text-sm cursor-pointer">{specialNeedsLabels[need] || need}</label>
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
                    <label htmlFor={`socialcontext-${context}`} className="text-sm cursor-pointer">{socialContextLabels[context] || context}</label>
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
      ) : (
        <div className="mb-4 text-sm opacity-70">
          Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} products
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => {
          const badge = getProductBadge(product);
          const isSaved = savedItems.products.includes(product.name);
          
          return (
            <div
              key={product.id}
              className="bg-[#EDE9DC] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              data-testid={`card-product-${product.id}`}
            >
              <div className="aspect-square bg-ivory overflow-hidden relative">
                <img
                  src={product.imageUrl || 'https://placehold.co/400x400/EDE9DC/8B7355?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  data-testid={`img-product-${product.id}`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x400/EDE9DC/8B7355?text=No+Image';
                  }}
                />
                {/* Save Button */}
                <button
                  onClick={(e) => handleSaveProduct(product, e)}
                  className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                  aria-label={isSaved ? "Unsave product" : "Save product"}
                  data-testid={`button-save-${product.id}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${isSaved ? 'fill-olive text-olive' : 'text-espresso'}`}
                  />
                </button>
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
                  {normalizeCategories(product.categories).slice(0, 2).map((category, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-sand text-espresso text-xs rounded"
                      data-testid={`tag-category-${idx}`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                {product.ageRange && (
                  <p className="text-xs opacity-70 mb-3">
                    Ages {formatAgeRange(product.ageRange)}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2"
            data-testid="button-prev-page"
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show first page, last page, current page, and pages around current
              const showPage = page === 1 || page === totalPages || 
                              (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!showPage && page === currentPage - 2) {
                return <span key={page} className="px-3 py-2">...</span>;
              }
              if (!showPage && page === currentPage + 2) {
                return <span key={page} className="px-3 py-2">...</span>;
              }
              if (!showPage) return null;
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 ${currentPage === page ? 'bg-olive text-white' : ''}`}
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2"
            data-testid="button-next-page"
          >
            Next
          </Button>
        </div>
      )}

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
