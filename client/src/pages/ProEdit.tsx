import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { type Pro, type ServiceOffering, type ServiceArea, type GalleryImage, type Subscription } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ProWithDetails = Pro & {
  services: ServiceOffering[];
  areas: ServiceArea[];
  gallery: GalleryImage[];
};

export default function ProEdit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [authUser, setAuthUser] = useState<any>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setLocation("/login");
          return;
        }
        const data = await res.json();
        setAuthUser(data.user);
        
        if (!data.user.proId) {
          toast({ title: "No professional profile found", variant: "destructive" });
          setLocation("/pros");
        }
      } catch {
        setLocation("/login");
      }
    };
    checkAuth();
  }, []);

  const { data: pro } = useQuery<ProWithDetails>({
    queryKey: ['/api/pros', authUser?.proId],
    enabled: !!authUser?.proId,
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['/api/subscriptions', authUser?.proId],
    enabled: !!authUser?.proId,
  });

  const [proData, setProData] = useState({
    name: "",
    about: "",
    address: "",
    phone: "",
    emailPublic: "",
    website: "",
  });

  const [serviceDialog, setServiceDialog] = useState(false);
  const [areaDialog, setAreaDialog] = useState(false);
  const [serviceData, setServiceData] = useState({ title: "", category: "", description: "", minPrice: "", maxPrice: "" });
  const [areaData, setAreaData] = useState({ label: "", zip: "", radiusMiles: "25" });

  useEffect(() => {
    if (pro) {
      setProData({
        name: pro.name || "",
        about: pro.about || "",
        address: pro.address || "",
        phone: pro.phone || "",
        emailPublic: pro.emailPublic || "",
        website: pro.website || "",
      });
    }
  }, [pro]);

  const isSubscriptionActive = subscription?.status === "active";

  const updateProMutation = useMutation({
    mutationFn: (data: typeof proData) => apiRequest(`/api/pros/${authUser?.proId}`, "POST", data),
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
    },
    onError: () => toast({ title: "Failed to update profile", variant: "destructive" }),
  });

  const addServiceMutation = useMutation({
    mutationFn: (data: typeof serviceData) => 
      apiRequest(`/api/pros/${authUser?.proId}/services`, "POST", {
        ...data,
        minPrice: data.minPrice ? parseFloat(data.minPrice) : null,
        maxPrice: data.maxPrice ? parseFloat(data.maxPrice) : null,
      }),
    onSuccess: () => {
      toast({ title: "Service added!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
      setServiceDialog(false);
      setServiceData({ title: "", category: "", description: "", minPrice: "", maxPrice: "" });
    },
    onError: () => toast({ title: "Failed to add service", variant: "destructive" }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => 
      apiRequest(`/api/pros/${authUser?.proId}/services/${serviceId}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Service deleted!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
    },
  });

  const addAreaMutation = useMutation({
    mutationFn: (data: typeof areaData) => 
      apiRequest(`/api/pros/${authUser?.proId}/areas`, "POST", {
        ...data,
        radiusMiles: parseInt(data.radiusMiles),
      }),
    onSuccess: () => {
      toast({ title: "Service area added!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
      setAreaDialog(false);
      setAreaData({ label: "", zip: "", radiusMiles: "25" });
    },
    onError: () => toast({ title: "Failed to add area", variant: "destructive" }),
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (areaId: string) => 
      apiRequest(`/api/pros/${authUser?.proId}/areas/${areaId}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Area deleted!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/pros/${authUser?.proId}/gallery`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Image uploaded!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
    },
    onError: () => toast({ title: "Failed to upload image", variant: "destructive" }),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imgId: string) => 
      apiRequest(`/api/pros/${authUser?.proId}/gallery/${imgId}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Image deleted!" });
      queryClient.invalidateQueries({ queryKey: ['/api/pros', authUser?.proId] });
    },
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest(`/api/subscriptions/${authUser?.proId}/activate`, "POST", {}),
    onSuccess: () => {
      toast({ title: "Subscription activated!" });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions', authUser?.proId] });
      setShowSubscriptionDialog(false);
    },
  });

  if (!authUser || !pro) {
    return <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!isSubscriptionActive) {
    return (
      <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-sentient font-bold text-[#2C1810] mb-4">Subscription Required</h1>
          <p className="text-[#2C1810]/70 mb-6">
            You need an active subscription to edit your professional profile and access the pro dashboard.
          </p>
          <Button
            data-testid="button-activate-subscription"
            onClick={() => activateSubscriptionMutation.mutate()}
            className="w-full bg-[#8B9A7F] hover:bg-[#E0A72C]"
          >
            {activateSubscriptionMutation.isPending ? "Activating..." : "Activate Subscription ($99/month)"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-sentient font-bold text-[#2C1810] mb-2">Edit Your Profile</h1>
          <p className="text-[#2C1810]/70">Manage your professional listing</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input data-testid="input-pro-name" placeholder="Business Name" value={proData.name} onChange={(e) => setProData({ ...proData, name: e.target.value })} />
            <Textarea data-testid="textarea-pro-about" placeholder="About Your Business" value={proData.about} onChange={(e) => setProData({ ...proData, about: e.target.value })} rows={4} />
            <Input data-testid="input-pro-address" placeholder="Address" value={proData.address} onChange={(e) => setProData({ ...proData, address: e.target.value })} />
            <Input data-testid="input-pro-phone" placeholder="Phone" value={proData.phone} onChange={(e) => setProData({ ...proData, phone: e.target.value })} />
            <Input data-testid="input-pro-email" placeholder="Public Email" value={proData.emailPublic} onChange={(e) => setProData({ ...proData, emailPublic: e.target.value })} />
            <Input data-testid="input-pro-website" placeholder="Website" value={proData.website} onChange={(e) => setProData({ ...proData, website: e.target.value })} />
            <Button data-testid="button-save-profile" onClick={() => updateProMutation.mutate(proData)} className="bg-[#8B9A7F] hover:bg-[#E0A72C]" disabled={updateProMutation.isPending}>
              {updateProMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Services</h2>
            <Button data-testid="button-add-service" onClick={() => setServiceDialog(true)} size="sm" className="bg-[#8B9A7F]"><Plus className="h-4 w-4 mr-1" />Add Service</Button>
          </div>
          <div className="space-y-2">
            {pro.services?.map((service) => (
              <div key={service.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{service.title}</p>
                  <p className="text-sm text-[#2C1810]/60">{service.category}</p>
                </div>
                <Button data-testid={`button-delete-service-${service.id}`} variant="ghost" size="sm" onClick={() => deleteServiceMutation.mutate(service.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Service Areas</h2>
            <Button data-testid="button-add-area" onClick={() => setAreaDialog(true)} size="sm" className="bg-[#8B9A7F]"><Plus className="h-4 w-4 mr-1" />Add Area</Button>
          </div>
          <div className="space-y-2">
            {pro.areas?.map((area) => (
              <div key={area.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{area.label}</p>
                  <p className="text-sm text-[#2C1810]/60">{area.zip} ({area.radiusMiles} miles)</p>
                </div>
                <Button data-testid={`button-delete-area-${area.id}`} variant="ghost" size="sm" onClick={() => deleteAreaMutation.mutate(area.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Gallery</h2>
            <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-[#8B9A7F] text-white hover:bg-[#E0A72C]" data-testid="button-upload-image">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImageMutation.mutate(e.target.files[0])} />
              <Upload className="h-4 w-4 mr-1" />Upload Image
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {pro.gallery?.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.title || ""} className="w-full aspect-square object-cover rounded" />
                <Button data-testid={`button-delete-image-${img.id}`} variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => deleteImageMutation.mutate(img.id)}><X className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input data-testid="input-service-title" placeholder="Service Title" value={serviceData.title} onChange={(e) => setServiceData({ ...serviceData, title: e.target.value })} />
              <Input data-testid="input-service-category" placeholder="Category" value={serviceData.category} onChange={(e) => setServiceData({ ...serviceData, category: e.target.value })} />
              <Textarea data-testid="textarea-service-description" placeholder="Description" value={serviceData.description} onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input data-testid="input-service-min-price" placeholder="Min Price" type="number" value={serviceData.minPrice} onChange={(e) => setServiceData({ ...serviceData, minPrice: e.target.value })} />
                <Input data-testid="input-service-max-price" placeholder="Max Price" type="number" value={serviceData.maxPrice} onChange={(e) => setServiceData({ ...serviceData, maxPrice: e.target.value })} />
              </div>
              <Button data-testid="button-submit-service" onClick={() => addServiceMutation.mutate(serviceData)} className="w-full bg-[#8B9A7F]">Add Service</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={areaDialog} onOpenChange={setAreaDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Service Area</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input data-testid="input-area-label" placeholder="Area Label" value={areaData.label} onChange={(e) => setAreaData({ ...areaData, label: e.target.value })} />
              <Input data-testid="input-area-zip" placeholder="ZIP Code" value={areaData.zip} onChange={(e) => setAreaData({ ...areaData, zip: e.target.value })} />
              <Input data-testid="input-area-radius" placeholder="Radius (miles)" type="number" value={areaData.radiusMiles} onChange={(e) => setAreaData({ ...areaData, radiusMiles: e.target.value })} />
              <Button data-testid="button-submit-area" onClick={() => addAreaMutation.mutate(areaData)} className="w-full bg-[#8B9A7F]">Add Area</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
