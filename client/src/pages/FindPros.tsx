import { Search, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  description: string;
}

export default function FindPros() {
  const [searchQuery, setSearchQuery] = useState('');

  const professionals: Professional[] = [
    {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      specialty: 'Child Development Specialist',
      location: 'San Francisco, CA',
      rating: 4.9,
      description: 'Board-certified pediatric occupational therapist with 15 years of experience in early childhood development.',
    },
    {
      id: '2',
      name: 'Emily Rodriguez, MS',
      specialty: 'Play Therapist',
      location: 'Austin, TX',
      rating: 4.8,
      description: 'Licensed play therapist specializing in developmental play and sensory integration.',
    },
    {
      id: '3',
      name: 'Dr. James Chen',
      specialty: 'Pediatric Psychologist',
      location: 'Seattle, WA',
      rating: 5.0,
      description: 'Clinical psychologist focusing on early intervention and developmental assessment.',
    },
    {
      id: '4',
      name: 'Maria Santos, OT',
      specialty: 'Occupational Therapist',
      location: 'Denver, CO',
      rating: 4.7,
      description: 'Pediatric OT with expertise in fine motor development and sensory processing.',
    },
  ];

  const filteredPros = professionals.filter((pro) =>
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-findpros-title">Find Professionals</h1>
        <p className="text-lg opacity-80">
          Connect with trusted child development specialists, therapists, and educators
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#EDE9DC] p-6 rounded-lg mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-espresso/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, specialty, or location..."
            className="w-full pl-10 pr-4 py-3 bg-ivory border-2 border-sand rounded-lg focus:border-olive focus:outline-none"
            data-testid="input-search-pros"
          />
        </div>
      </div>

      {/* Professionals List */}
      {filteredPros.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg opacity-70">No professionals found matching your search.</p>
        </div>
      )}

      <div className="space-y-6">
        {filteredPros.map((pro) => (
          <div
            key={pro.id}
            className="bg-[#EDE9DC] p-6 rounded-lg shadow-md hover:shadow-lg transition"
            data-testid={`card-pro-${pro.id}`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-pro-name-${pro.id}`}>
                  {pro.name}
                </h3>
                <p className="text-ochre font-medium mb-2">{pro.specialty}</p>
                <div className="flex items-center gap-2 mb-3 text-sm opacity-70">
                  <MapPin className="w-4 h-4" />
                  <span>{pro.location}</span>
                </div>
                <p className="opacity-80">{pro.description}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-1 bg-ochre/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-ochre fill-ochre" />
                  <span className="font-semibold">{pro.rating}</span>
                </div>
                <button
                  className="px-6 py-2 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium"
                  data-testid={`button-contact-${pro.id}`}
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-12 bg-gradient-to-r from-blush/20 to-sand/20 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Directory Launching Soon</h2>
        <p className="mb-6 opacity-80">
          We're building a comprehensive directory of vetted child development professionals. Join our waitlist to be notified when it launches.
        </p>
        <button
          className="px-6 py-3 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium"
          data-testid="button-join-waitlist"
        >
          Join Waitlist
        </button>
      </div>
    </div>
  );
}
