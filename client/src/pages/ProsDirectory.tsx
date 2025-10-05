import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MapPin } from "lucide-react";
import { type Professional } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [ratingMin, setRatingMin] = useState<string>("all");

  const { data: professionals = [], isLoading } = useQuery<Professional[]>({
    queryKey: ['/api/professionals'],
  });

  const filteredPros = professionals.filter((pro) => {
    const matchesSearch = 
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = specialty === 'all' || pro.specialty.toLowerCase().includes(specialty.toLowerCase());
    
    const matchesRating = ratingMin === 'all' || parseFloat(pro.rating) >= parseFloat(ratingMin);
    
    return matchesSearch && matchesSpecialty && matchesRating;
  });

  const uniqueSpecialties = Array.from(new Set(professionals.map(p => p.specialty))).sort();

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-sentient font-bold text-espresso mb-2" data-testid="text-pros-title">
            Find Professionals
          </h1>
          <p className="text-lg text-espresso/70">Connect with trusted child development specialists and service providers</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-espresso/40 h-4 w-4" />
              <Input
                data-testid="input-search-pros"
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger data-testid="select-specialty">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {uniqueSpecialties.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
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
        ) : filteredPros.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">No professionals found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro) => (
              <div
                key={pro.id}
                data-testid={`card-pro-${pro.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col"
              >
                <div className="h-48 bg-sand/30 flex items-center justify-center">
                  <div className="w-20 h-20 bg-ochre/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-ochre">
                      {pro.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-sentient font-bold text-espresso mb-2" data-testid={`text-pro-name-${pro.id}`}>
                    {pro.name}
                  </h3>

                  <p className="text-ochre font-medium mb-3">{pro.specialty}</p>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-ochre text-ochre" />
                    <span className="font-medium text-espresso" data-testid={`text-rating-${pro.id}`}>
                      {pro.rating}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-espresso/70 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{pro.location}</span>
                  </div>

                  <p className="text-sm text-espresso/70 mb-4 flex-1 line-clamp-3">
                    {pro.description}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    <Button 
                      data-testid={`button-contact-${pro.id}`} 
                      className="flex-1 bg-olive hover:bg-ochre text-white"
                      onClick={() => {
                        if (pro.email) {
                          window.location.href = `mailto:${pro.email}`;
                        }
                      }}
                      disabled={!pro.email}
                    >
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-12 bg-gradient-to-r from-blush/20 to-sand/20 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Directory Launching Soon</h2>
          <p className="mb-6 opacity-80">
            We're building a comprehensive directory of vetted child development professionals. Join our waitlist to be notified when it launches.
          </p>
          <Button
            className="bg-olive hover:bg-ochre text-white"
            data-testid="button-join-waitlist"
          >
            Join Waitlist
          </Button>
        </div>
      </div>
    </div>
  );
}
