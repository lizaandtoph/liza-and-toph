import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Plus, Edit2, Trash2, X } from 'lucide-react';
import { insertProductSchema, updateProductSchema, type Product, type InsertProduct } from '@shared/schema';
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
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
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
      price: '',
      imageUrl: '',
      categories: [],
      ageRange: '6-12 months',
      rating: '5.0',
      reviewCount: 0,
      affiliateUrl: '',
      isTopPick: false,
      isBestseller: false,
      isNew: false,
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
      price: product.price,
      imageUrl: product.imageUrl,
      categories: product.categories || [],
      ageRange: product.ageRange,
      rating: product.rating,
      reviewCount: product.reviewCount,
      affiliateUrl: product.affiliateUrl || '',
      isTopPick: product.isTopPick || false,
      isBestseller: product.isBestseller || false,
      isNew: product.isNew || false,
    });
  };

  const ageRanges = [
    '0-6 months',
    '6-12 months',
    '12-18 months',
    '18-24 months',
    '2-3 years',
    '3-4 years',
    '4-5 years',
  ];

  const categories = ['cognitive', 'motor', 'social-emotional', 'language', 'creative'];

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
                      <span data-testid={`text-product-price-${product.id}`}><strong>Price:</strong> {product.price}</span>
                      <span data-testid={`text-product-rating-${product.id}`}><strong>Rating:</strong> {product.rating} ({product.reviewCount} reviews)</span>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="$19.99" data-testid="input-price" />
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
                      <SelectContent>
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="1" max="5" data-testid="input-rating" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="reviewCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Count</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0"
                        value={field.value || 0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        data-testid="input-reviewCount" 
                      />
                    </FormControl>
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
                                field.onChange(current.filter((c: string) => c !== category));
                              }
                            }}
                            data-testid={`checkbox-category-${category}`}
                          />
                          <label className="capitalize cursor-pointer" onClick={() => {
                            const current = field.value || [];
                            const isChecked = current.includes(category);
                            if (isChecked) {
                              field.onChange(current.filter((c: string) => c !== category));
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="$19.99" data-testid="input-edit-price" />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-ageRange">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="1" max="5" data-testid="input-edit-rating" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="reviewCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Count</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0"
                        value={field.value || 0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        data-testid="input-edit-reviewCount" 
                      />
                    </FormControl>
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
                                field.onChange(current.filter((c: string) => c !== category));
                              }
                            }}
                            data-testid={`checkbox-edit-category-${category}`}
                          />
                          <label className="capitalize cursor-pointer" onClick={() => {
                            const current = field.value || [];
                            const isChecked = current.includes(category);
                            if (isChecked) {
                              field.onChange(current.filter((c: string) => c !== category));
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
