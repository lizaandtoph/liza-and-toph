import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Trash2, Eye, Edit } from "lucide-react";
import { type Pro } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminProsManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setLocation("/login");
          return;
        }
        const data = await res.json();
        if (data.user.role !== "admin") {
          toast({ title: "Admin access required", variant: "destructive" });
          setLocation("/");
          return;
        }
        setAuthUser(data.user);
      } catch {
        setLocation("/login");
      }
    };
    checkAuth();
  }, []);

  const { data: pros = [], isLoading } = useQuery<Pro[]>({
    queryKey: ['/api/pros'],
  });

  const filteredPros = pros.filter(pro => 
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pro.about || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authUser) {
    return <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-sentient font-bold text-[#2C1810] mb-2">Admin: Manage Professionals</h1>
          <p className="text-[#2C1810]/70">View and manage all professional listings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Input
            data-testid="input-search-pros"
            placeholder="Search professionals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">Loading professionals...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#EDE9DC]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C1810]">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C1810]">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C1810]">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C1810]">Reviews</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C1810]">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C1810]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPros.map((pro, index) => (
                  <tr key={pro.id} data-testid={`row-pro-${pro.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FFFEF5]'}>
                    <td className="px-4 py-3 text-sm text-[#2C1810]">{pro.name}</td>
                    <td className="px-4 py-3 text-sm text-[#2C1810]/70">{pro.address?.split(',').slice(-2).join(',').trim() || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-[#2C1810]">{pro.rating?.toFixed(1) || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-[#2C1810]/70">{pro.reviewCount}</td>
                    <td className="px-4 py-3 text-sm text-[#2C1810]/70">{pro.priceRange || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/pros/${pro.slug}`}>
                          <Button data-testid={`button-view-pro-${pro.id}`} variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
