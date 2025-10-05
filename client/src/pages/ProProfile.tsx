import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Star, MapPin, Phone, Mail, Globe, Award, MessageSquare } from "lucide-react";
import { type Pro, type ServiceOffering, type ServiceArea, type GalleryImage, type Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ProWithDetails = Pro & {
  services: ServiceOffering[];
  areas: ServiceArea[];
  gallery: GalleryImage[];
  reviews: Review[];
};

export default function ProProfile() {
  const [, params] = useRoute("/pros/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageData, setMessageData] = useState({
    fromName: "",
    fromEmail: "",
    phone: "",
    subject: "",
    body: "",
  });

  const { data: pro, isLoading } = useQuery<ProWithDetails>({
    queryKey: ['/api/pros', slug],
    enabled: !!slug,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: typeof messageData) => 
      apiRequest(`/api/pros/${pro?.id}/messages`, "POST", data),
    onSuccess: () => {
      toast({ title: "Message sent successfully!" });
      setMessageOpen(false);
      setMessageData({ fromName: "", fromEmail: "", phone: "", subject: "", body: "" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center">
        <p className="text-lg">Loading professional profile...</p>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Professional not found</p>
          <Link href="/pros">
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {pro.coverUrl && (
        <div className="h-64 bg-[#EDE9DC]">
          <img src={pro.coverUrl} alt={pro.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-24 bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {pro.logoUrl && (
              <img
                src={pro.logoUrl}
                alt={pro.name}
                className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow"
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-sentient font-bold text-[#2C1810] mb-2" data-testid="text-pro-name">
                {pro.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-[#E0A72C] text-[#E0A72C]" />
                  <span className="font-bold text-lg" data-testid="text-rating">
                    {pro.rating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <span className="text-[#2C1810]/60">({pro.reviewCount} reviews)</span>
              </div>

              {pro.badges && pro.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {pro.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#8B9A7F]/10 text-[#8B9A7F] rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      <Award className="h-4 w-4" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-request-quote" className="bg-[#8B9A7F] hover:bg-[#E0A72C]">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Quote
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact {pro.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      data-testid="input-contact-name"
                      placeholder="Your Name"
                      value={messageData.fromName}
                      onChange={(e) => setMessageData({ ...messageData, fromName: e.target.value })}
                    />
                    <Input
                      data-testid="input-contact-email"
                      type="email"
                      placeholder="Your Email"
                      value={messageData.fromEmail}
                      onChange={(e) => setMessageData({ ...messageData, fromEmail: e.target.value })}
                    />
                    <Input
                      data-testid="input-contact-phone"
                      placeholder="Phone (optional)"
                      value={messageData.phone}
                      onChange={(e) => setMessageData({ ...messageData, phone: e.target.value })}
                    />
                    <Input
                      data-testid="input-contact-subject"
                      placeholder="Subject"
                      value={messageData.subject}
                      onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                    />
                    <Textarea
                      data-testid="textarea-contact-message"
                      placeholder="Your Message"
                      value={messageData.body}
                      onChange={(e) => setMessageData({ ...messageData, body: e.target.value })}
                      rows={4}
                    />
                    <Button
                      data-testid="button-send-message"
                      className="w-full bg-[#8B9A7F] hover:bg-[#E0A72C]"
                      onClick={() => sendMessageMutation.mutate(messageData)}
                      disabled={sendMessageMutation.isPending || !messageData.fromName || !messageData.fromEmail || !messageData.subject || !messageData.body}
                    >
                      {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {pro.phone && (
                <a href={`tel:${pro.phone}`}>
                  <Button variant="outline" className="w-full" data-testid="button-call">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </a>
              )}

              {pro.website && (
                <a href={pro.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full" data-testid="button-website">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pb-12">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-sentient font-bold text-[#2C1810] mb-4">About</h2>
              <p className="text-[#2C1810]/80 whitespace-pre-wrap">{pro.about}</p>
            </div>

            {pro.services && pro.services.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-sentient font-bold text-[#2C1810] mb-4">Services Offered</h2>
                <div className="space-y-4">
                  {pro.services.map((service) => (
                    <div key={service.id} className="border-l-4 border-[#8B9A7F] pl-4">
                      <h3 className="font-bold text-[#2C1810] mb-1">{service.title}</h3>
                      <p className="text-sm text-[#2C1810]/60 mb-1">{service.category}</p>
                      {service.description && (
                        <p className="text-sm text-[#2C1810]/80 mb-2">{service.description}</p>
                      )}
                      {service.minPrice !== null && service.maxPrice !== null && (
                        <p className="text-sm font-medium text-[#8B9A7F]">
                          ${service.minPrice} - ${service.maxPrice}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pro.gallery && pro.gallery.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-sentient font-bold text-[#2C1810] mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pro.gallery.map((image) => (
                    <div key={image.id} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title || "Gallery image"}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pro.reviews && pro.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-sentient font-bold text-[#2C1810] mb-4">Reviews</h2>
                <div className="space-y-4">
                  {pro.reviews.map((review) => (
                    <div key={review.id} className="border-b border-[#2C1810]/10 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-[#E0A72C] text-[#E0A72C]"
                                  : "text-[#2C1810]/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-[#2C1810]">{review.authorName}</span>
                      </div>
                      <p className="text-[#2C1810]/80">{review.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-[#2C1810] mb-4">Contact Information</h3>
              <div className="space-y-3">
                {pro.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#8B9A7F] mt-1" />
                    <span className="text-sm text-[#2C1810]/80">{pro.address}</span>
                  </div>
                )}
                {pro.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#8B9A7F]" />
                    <span className="text-sm text-[#2C1810]/80">{pro.phone}</span>
                  </div>
                )}
                {pro.emailPublic && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#8B9A7F]" />
                    <span className="text-sm text-[#2C1810]/80">{pro.emailPublic}</span>
                  </div>
                )}
                {pro.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#8B9A7F]" />
                    <a
                      href={pro.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#8B9A7F] hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {pro.areas && pro.areas.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-[#2C1810] mb-4">Service Areas</h3>
                <div className="space-y-2">
                  {pro.areas.map((area) => (
                    <div key={area.id} className="text-sm text-[#2C1810]/80">
                      <p className="font-medium">{area.label}</p>
                      <p className="text-xs text-[#2C1810]/60">
                        {area.zip} ({area.radiusMiles} miles radius)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pro.licenseNumber && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-[#2C1810] mb-2">License</h3>
                <p className="text-sm text-[#2C1810]/80">{pro.licenseNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
