import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Star, MapPin, DollarSign, Filter } from "lucide-react";
import { type Pro } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [ratingMin, setRatingMin] = useState<string>("all");

  const { data: pros = [], isLoading } = useQuery<Pro[]>({
    queryKey: ['/api/pros', { q: searchQuery, category: category !== 'all' ? category : undefined, priceRange: priceRange !== 'all' ? priceRange : undefined, ratingMin: ratingMin !== 'all' ? parseFloat(ratingMin) : undefined }],
  });

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-sentient font-bold text-[#2C1810] mb-2">Find Professionals</h1>
          <p className="text-lg text-[#2C1810]/70">Connect with trusted child development specialists and service providers</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C1810]/40 h-4 w-4" />
              <Input
                data-testid="input-search-pros"
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Installation">Installation</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger data-testid="select-price">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="$">$ - Budget</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Premium</SelectItem>
                <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingMin} onValueChange={setRatingMin}>
              <SelectTrigger data-testid="select-rating">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.0">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.8">4.8+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">Loading professionals...</p>
          </div>
        ) : pros.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">No professionals found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pros.map((pro) => (
              <Link key={pro.id} href={`/pros/${pro.slug}`}>
                <div
                  data-testid={`card-pro-${pro.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer h-full flex flex-col"
                >
                  {pro.logoUrl && (
                    <div className="h-48 bg-[#EDE9DC] flex items-center justify-center">
                      <img
                        src={pro.logoUrl}
                        alt={pro.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-sentient font-bold text-[#2C1810] mb-2" data-testid={`text-pro-name-${pro.id}`}>
                      {pro.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-[#E0A72C] text-[#E0A72C]" />
                      <span className="font-medium text-[#2C1810]" data-testid={`text-rating-${pro.id}`}>
                        {pro.rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-sm text-[#2C1810]/60">
                        ({pro.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#2C1810]/70 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{pro.address?.split(',').slice(-2).join(',').trim() || 'Location not specified'}</span>
                    </div>

                    {pro.priceRange && (
                      <div className="flex items-center gap-2 text-sm text-[#2C1810]/70 mb-4">
                        <DollarSign className="h-4 w-4" />
                        <span>{pro.priceRange}</span>
                      </div>
                    )}

                    {pro.badges && pro.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pro.badges.slice(0, 2).map((badge, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#8B9A7F]/10 text-[#8B9A7F] rounded text-xs"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-[#2C1810]/70 mb-4 flex-1 line-clamp-3">
                      {pro.about}
                    </p>

                    <div className="flex gap-2 mt-auto">
                      <Button data-testid={`button-view-profile-${pro.id}`} className="flex-1 bg-[#8B9A7F] hover:bg-[#E0A72C] text-white">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
