import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Package, Plus, Edit2, Trash2, X } from 'lucide-react';
import { insertProductSchema, updateProductSchema, type Product, type InsertProduct } from '@shared/schema';
import { getAgeBandLabel } from '@shared/ageUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
    enabled: !!authUser,
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest('POST', '/api/admin/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({ title: 'Product created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create product', variant: 'destructive' });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PUT', `/api/admin/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setEditingProduct(null);
      toast({ title: 'Product updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update product', variant: 'destructive' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({ title: 'Product deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    },
  });

  const createForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      imageUrl: '',
      categories: [],
      ageRange: '6-12 months',
      affiliateUrl: '',
      isTopPick: false,
      isBestseller: false,
      isNew: false,
      
      // Age filtering
      minAgeMonths: null,
      maxAgeMonths: null,
      ageRangeCategory: null,
      
      // Developmental support
      communicationLevels: [],
      motorLevels: [],
      cognitiveLevels: [],
      socialEmotionalLevels: [],
      
      // Play type tags
      playTypeTags: [],
      
      // Complexity and challenge
      complexityLevel: null,
      challengeRating: null,
      attentionDuration: null,
      
      // Temperament compatibility
      stimulationLevel: null,
      structurePreference: null,
      energyRequirement: null,
      sensoryCompatibility: [],
      
      // Social context
      socialContext: [],
      cooperationRequired: null,
      
      // Safety and special needs
      safetyConsiderations: [],
      specialNeedsSupport: [],
      interventionFocus: [],
      
      // Environmental factors
      noiseLevel: null,
      messFactor: null,
      setupTime: null,
      spaceRequirements: null,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(updateProductSchema),
  });

  const handleCreateSubmit = (data: InsertProduct) => {
    createProductMutation.mutate(data);
  };

  const handleEditSubmit = (data: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      brand: product.brand,
      description: product.description,
      imageUrl: product.imageUrl,
      categories: product.categories || [],
      ageRange: product.ageRange,
      affiliateUrl: product.affiliateUrl || '',
      isTopPick: product.isTopPick || false,
      isBestseller: product.isBestseller || false,
      isNew: product.isNew || false,
      
      // Age filtering
      minAgeMonths: product.minAgeMonths || null,
      maxAgeMonths: product.maxAgeMonths || null,
      ageRangeCategory: product.ageRangeCategory || null,
      
      // Developmental support
      communicationLevels: product.communicationLevels || [],
      motorLevels: product.motorLevels || [],
      cognitiveLevels: product.cognitiveLevels || [],
      socialEmotionalLevels: product.socialEmotionalLevels || [],
      
      // Play type tags
      playTypeTags: product.playTypeTags || [],
      
      // Complexity and challenge
      complexityLevel: product.complexityLevel || null,
      challengeRating: product.challengeRating || null,
      attentionDuration: product.attentionDuration || null,
      
      // Temperament compatibility
      stimulationLevel: product.stimulationLevel || null,
      structurePreference: product.structurePreference || null,
      energyRequirement: product.energyRequirement || null,
      sensoryCompatibility: product.sensoryCompatibility || [],
      
      // Social context
      socialContext: product.socialContext || [],
      cooperationRequired: product.cooperationRequired || null,
      
      // Safety and special needs
      safetyConsiderations: product.safetyConsiderations || [],
      specialNeedsSupport: product.specialNeedsSupport || [],
      interventionFocus: product.interventionFocus || [],
      
      // Environmental factors
      noiseLevel: product.noiseLevel || null,
      messFactor: product.messFactor || null,
      setupTime: product.setupTime || null,
      spaceRequirements: product.spaceRequirements || null,
    });
  };

  // Age ranges matching onboarding age bands
  const ageBands = [
    'newborn-18m',
    '18m-3y',
    '2-5y',
    '3-6y',
    '4-7y',
    '5-8y',
    '6-9y',
    '7-10y',
    '8-11y',
    '9-12y',
    '10-early-teens',
    'preteens-older-teens',
  ] as const;
  
  const ageRanges = ageBands.map(band => getAgeBandLabel(band));

  const categories = ['cognitive', 'motor', 'social-emotional', 'language', 'creative'];
  
  // Developmental filtering constants
  const developmentalLevels = ['emerging', 'developing', 'proficient', 'advanced'];
  
  const playTypes = [
    'sensory', 'exploratory', 'functional', 'constructive', 'pretend', 'symbolic',
    'gross_motor', 'fine_motor', 'cognitive', 'social', 'language', 'creative'
  ];
  
  const complexityLevels = ['simple', 'moderate', 'complex', 'advanced', 'expert'];
  
  const attentionDurations = [
    'quick_activities',
    'medium_activities',
    'detailed_activities',
    'complex_projects',
    'advanced_building'
  ];
  
  const stimulationLevels = ['low', 'moderate', 'high'];
  const structurePreferences = ['structured', 'flexible', 'open_ended'];
  const energyRequirements = ['sedentary', 'moderate', 'active', 'high_energy'];
  const sensoryTypes = ['gentle', 'moderate', 'intense'];
  
  const socialContexts = ['solo_play', 'paired_play', 'group_play', 'family_play'];
  
  const safetyTypes = ['choking_hazard', 'supervision_required', 'small_parts', 'age_appropriate'];
  const specialNeedsTypes = ['autism_friendly', 'sensory_processing', 'speech_therapy', 'motor_therapy'];
  const interventionTypes = ['communication', 'motor_skills', 'social_skills', 'behavior_support'];
  
  const noiseLevels = ['quiet', 'moderate', 'loud'];
  const messFactors = ['minimal', 'moderate', 'messy'];
  const setupTimes = ['immediate', 'quick', 'moderate', 'extended'];
  const spaceOptions = ['small', 'medium', 'large', 'outdoor'];

  if (!authUser) {
    return <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="bg-gradient-to-br from-olive/20 via-ivory to-sand/20 py-8 px-6 rounded-2xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-12 h-12 text-olive" />
              <h1 className="text-4xl font-bold" data-testid="heading-admin-products">Product Management</h1>
            </div>
            <p className="opacity-70">Create, edit, and manage product items</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="lg" data-testid="button-create-product">
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-products">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-sand" data-testid="empty-products">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first product</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} data-testid={`card-product-${product.id}`}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded-lg"
                    data-testid={`img-product-${product.id}`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold mb-1" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-product-brand-${product.id}`}>Brand: {product.brand}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} data-testid={`button-edit-${product.id}`}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} data-testid={`button-delete-${product.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-3" data-testid={`text-product-description-${product.id}`}>{product.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>Age:</strong> {product.ageRange}</span>
                    </div>
                    {product.affiliateUrl && (
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-olive hover:underline mt-2 block" data-testid={`link-affiliate-${product.id}`}>
                        View on external site →
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#fff9ec]">
          <DialogHeader>
            <DialogTitle data-testid="heading-create-product">Create New Product</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-brand" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid="input-imageUrl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-ageRange">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#fff9ed] max-h-[300px] overflow-y-auto">
                        {ageRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="affiliateUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (External URL)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="https://..." data-testid="input-affiliateUrl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(category) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, category]);
                              } else {
                                field.onChange((current as string[]).filter((c: string) => c !== category));
                              }
                            }}
                            data-testid={`checkbox-category-${category}`}
                          />
                          <label className="capitalize cursor-pointer" onClick={() => {
                            const current = field.value || [];
                            const isChecked = current.includes(category);
                            if (isChecked) {
                              field.onChange((current as string[]).filter((c: string) => c !== category));
                            } else {
                              field.onChange([...current, category]);
                            }
                          }}>
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={createForm.control}
                  name="isTopPick"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-isTopPick" />
                      </FormControl>
                      <FormLabel className="!mt-0">Top Pick</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="isBestseller"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-isBestseller" />
                      </FormControl>
                      <FormLabel className="!mt-0">Bestseller</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-isNew" />
                      </FormControl>
                      <FormLabel className="!mt-0">New</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Developmental Filtering Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Developmental Filtering</h3>
                
                {/* Age Filtering */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Age Range (Months)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="minAgeMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Age (Months)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-minAgeMonths" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="maxAgeMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Age (Months)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-maxAgeMonths" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Developmental Support */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Developmental Support Levels</h4>
                  <FormField
                    control={createForm.control}
                    name="communicationLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-communication-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="motorLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motor Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-motor-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="cognitiveLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognitive Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-cognitive-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="socialEmotionalLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social-Emotional Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-socialEmotional-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Play Characteristics */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Play Characteristics</h4>
                  <FormField
                    control={createForm.control}
                    name="playTypeTags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Play Types</FormLabel>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {playTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(type) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, type] : (current as string[]).filter((t: string) => t !== type));
                                }}
                                data-testid={`checkbox-playType-${type}`}
                              />
                              <label className="capitalize text-sm">{type.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="complexityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complexity Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-complexityLevel">
                                <SelectValue placeholder="Select complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {complexityLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="challengeRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenge Rating (1-5)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-challengeRating" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="attentionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attention Duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-attentionDuration">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#fff9ed]">
                            {attentionDurations.map((duration) => (
                              <SelectItem key={duration} value={duration}>{duration.replace(/_/g, ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Temperament & Energy */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Temperament & Energy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="stimulationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stimulation Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-stimulationLevel">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {stimulationLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="structurePreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Structure Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-structurePreference">
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {structurePreferences.map((pref) => (
                                <SelectItem key={pref} value={pref}>{pref.replace('_', ' ')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="energyRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energy Requirement</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-energyRequirement">
                              <SelectValue placeholder="Select requirement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#fff9ed]">
                            {energyRequirements.map((req) => (
                              <SelectItem key={req} value={req}>{req.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="sensoryCompatibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sensory Compatibility</FormLabel>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {sensoryTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(type) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, type] : (current as string[]).filter((t: string) => t !== type));
                                }}
                                data-testid={`checkbox-sensory-${type}`}
                              />
                              <label className="capitalize text-sm">{type}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Social & Safety */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Social & Safety</h4>
                  <FormField
                    control={createForm.control}
                    name="socialContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Context</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {socialContexts.map((context) => (
                            <div key={context} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(context) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, context] : (current as string[]).filter((c: string) => c !== context));
                                }}
                                data-testid={`checkbox-socialContext-${context}`}
                              />
                              <label className="capitalize text-sm">{context.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="cooperationRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-cooperationRequired" />
                        </FormControl>
                        <FormLabel className="!mt-0">Cooperation Required</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="safetyConsiderations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Safety Considerations</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {safetyTypes.map((safety) => (
                            <div key={safety} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(safety) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, safety] : (current as string[]).filter((s: string) => s !== safety));
                                }}
                                data-testid={`checkbox-safety-${safety}`}
                              />
                              <label className="capitalize text-sm">{safety.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="specialNeedsSupport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Needs Support</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {specialNeedsTypes.map((need) => (
                            <div key={need} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(need) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, need] : (current as string[]).filter((n: string) => n !== need));
                                }}
                                data-testid={`checkbox-specialNeeds-${need}`}
                              />
                              <label className="capitalize text-sm">{need.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="interventionFocus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervention Focus</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {interventionTypes.map((intervention) => (
                            <div key={intervention} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(intervention) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, intervention] : (current as string[]).filter((i: string) => i !== intervention));
                                }}
                                data-testid={`checkbox-intervention-${intervention}`}
                              />
                              <label className="capitalize text-sm">{intervention.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Environment */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Environmental Factors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="noiseLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Noise Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-noiseLevel">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {noiseLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="messFactor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mess Factor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-messFactor">
                                <SelectValue placeholder="Select factor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {messFactors.map((factor) => (
                                <SelectItem key={factor} value={factor}>{factor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="setupTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setup Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-setupTime">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {setupTimes.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="spaceRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Space Requirements</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-spaceRequirements">
                                <SelectValue placeholder="Select requirement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {spaceOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
                  Cancel
                </Button>
                <Button type="submit" disabled={createProductMutation.isPending} data-testid="button-submit-create">
                  {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto bg-[#fff9ed]">
          <DialogHeader>
            <DialogTitle data-testid="heading-edit-product">Edit Product</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-brand" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-edit-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid="input-edit-imageUrl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-ageRange">
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#fff9ed] max-h-[300px] overflow-y-auto z-[100]">
                        {ageRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="affiliateUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (External URL)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="https://..." data-testid="input-edit-affiliateUrl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(category) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, category]);
                              } else {
                                field.onChange((current as string[]).filter((c: string) => c !== category));
                              }
                            }}
                            data-testid={`checkbox-edit-category-${category}`}
                          />
                          <label className="capitalize cursor-pointer" onClick={() => {
                            const current = field.value || [];
                            const isChecked = current.includes(category);
                            if (isChecked) {
                              field.onChange((current as string[]).filter((c: string) => c !== category));
                            } else {
                              field.onChange([...current, category]);
                            }
                          }}>
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={editForm.control}
                  name="isTopPick"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-edit-isTopPick" />
                      </FormControl>
                      <FormLabel className="!mt-0">Top Pick</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isBestseller"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-edit-isBestseller" />
                      </FormControl>
                      <FormLabel className="!mt-0">Bestseller</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-edit-isNew" />
                      </FormControl>
                      <FormLabel className="!mt-0">New</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Developmental Filtering Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Developmental Filtering</h3>
                
                {/* Age Filtering */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Age Range (Months)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="minAgeMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Age (Months)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-edit-minAgeMonths" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="maxAgeMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Age (Months)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-edit-maxAgeMonths" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Developmental Support */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Developmental Support Levels</h4>
                  <FormField
                    control={editForm.control}
                    name="communicationLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-edit-communication-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="motorLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motor Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-edit-motor-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="cognitiveLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognitive Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-edit-cognitive-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="socialEmotionalLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social-Emotional Levels</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {developmentalLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, level] : (current as string[]).filter((l: string) => l !== level));
                                }}
                                data-testid={`checkbox-edit-socialEmotional-${level}`}
                              />
                              <label className="capitalize text-sm">{level}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Play Characteristics */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Play Characteristics</h4>
                  <FormField
                    control={editForm.control}
                    name="playTypeTags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Play Types</FormLabel>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {playTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(type) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, type] : (current as string[]).filter((t: string) => t !== type));
                                }}
                                data-testid={`checkbox-edit-playType-${type}`}
                              />
                              <label className="capitalize text-sm">{type.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="complexityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complexity Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-complexityLevel">
                                <SelectValue placeholder="Select complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {complexityLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="challengeRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenge Rating (1-5)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-edit-challengeRating" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="attentionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attention Duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-attentionDuration">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#fff9ed]">
                            {attentionDurations.map((duration) => (
                              <SelectItem key={duration} value={duration}>{duration.replace(/_/g, ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Temperament & Energy */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Temperament & Energy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="stimulationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stimulation Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-stimulationLevel">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {stimulationLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="structurePreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Structure Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-structurePreference">
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {structurePreferences.map((pref) => (
                                <SelectItem key={pref} value={pref}>{pref.replace('_', ' ')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="energyRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energy Requirement</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-energyRequirement">
                              <SelectValue placeholder="Select requirement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#fff9ed]">
                            {energyRequirements.map((req) => (
                              <SelectItem key={req} value={req}>{req.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="sensoryCompatibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sensory Compatibility</FormLabel>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {sensoryTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(type) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, type] : (current as string[]).filter((t: string) => t !== type));
                                }}
                                data-testid={`checkbox-edit-sensory-${type}`}
                              />
                              <label className="capitalize text-sm">{type}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Social & Safety */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Social & Safety</h4>
                  <FormField
                    control={editForm.control}
                    name="socialContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Context</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {socialContexts.map((context) => (
                            <div key={context} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(context) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, context] : (current as string[]).filter((c: string) => c !== context));
                                }}
                                data-testid={`checkbox-edit-socialContext-${context}`}
                              />
                              <label className="capitalize text-sm">{context.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="cooperationRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-edit-cooperationRequired" />
                        </FormControl>
                        <FormLabel className="!mt-0">Cooperation Required</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="safetyConsiderations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Safety Considerations</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {safetyTypes.map((safety) => (
                            <div key={safety} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(safety) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, safety] : (current as string[]).filter((s: string) => s !== safety));
                                }}
                                data-testid={`checkbox-edit-safety-${safety}`}
                              />
                              <label className="capitalize text-sm">{safety.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="specialNeedsSupport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Needs Support</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {specialNeedsTypes.map((need) => (
                            <div key={need} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(need) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, need] : (current as string[]).filter((n: string) => n !== need));
                                }}
                                data-testid={`checkbox-edit-specialNeeds-${need}`}
                              />
                              <label className="capitalize text-sm">{need.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="interventionFocus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervention Focus</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {interventionTypes.map((intervention) => (
                            <div key={intervention} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(intervention) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, intervention] : (current as string[]).filter((i: string) => i !== intervention));
                                }}
                                data-testid={`checkbox-edit-intervention-${intervention}`}
                              />
                              <label className="capitalize text-sm">{intervention.replace('_', ' ')}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Environment */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Environmental Factors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="noiseLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Noise Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-noiseLevel">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {noiseLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="messFactor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mess Factor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-messFactor">
                                <SelectValue placeholder="Select factor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {messFactors.map((factor) => (
                                <SelectItem key={factor} value={factor}>{factor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="setupTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setup Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-setupTime">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {setupTimes.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="spaceRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Space Requirements</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-spaceRequirements">
                                <SelectValue placeholder="Select requirement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#fff9ed]">
                              {spaceOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending} data-testid="button-submit-edit">
                  {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
