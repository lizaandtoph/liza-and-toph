import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, Edit2, Trash2, MapPin, Star } from 'lucide-react';
import { insertProfessionalSchema, updateProfessionalSchema, type Professional, type InsertProfessional } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function AdminPros() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  const { data: professionals = [], isLoading } = useQuery<Professional[]>({
    queryKey: ['/api/admin/professionals'],
  });

  const createProfessionalMutation = useMutation({
    mutationFn: (data: InsertProfessional) => apiRequest('POST', '/api/admin/professionals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({ title: 'Professional created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create professional', variant: 'destructive' });
    },
  });

  const updateProfessionalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PUT', `/api/admin/professionals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      setEditingProfessional(null);
      toast({ title: 'Professional updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update professional', variant: 'destructive' });
    },
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/professionals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      toast({ title: 'Professional deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete professional', variant: 'destructive' });
    },
  });

  const createForm = useForm<InsertProfessional>({
    resolver: zodResolver(insertProfessionalSchema),
    defaultValues: {
      name: '',
      specialty: '',
      location: '',
      rating: '5.0',
      description: '',
    },
  });

  const editForm = useForm({
    resolver: zodResolver(updateProfessionalSchema),
  });

  const handleCreateSubmit = (data: InsertProfessional) => {
    createProfessionalMutation.mutate(data);
  };

  const handleEditSubmit = (data: any) => {
    if (editingProfessional) {
      updateProfessionalMutation.mutate({ id: editingProfessional.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this professional?')) {
      deleteProfessionalMutation.mutate(id);
    }
  };

  const openEditDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    editForm.reset({
      name: professional.name,
      specialty: professional.specialty,
      location: professional.location,
      rating: professional.rating,
      description: professional.description,
    });
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-olive" />
            <h1 className="text-4xl font-bold" data-testid="text-admin-pros-title">Professional Management</h1>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-olive hover:bg-ochre"
            data-testid="button-add-professional"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Professional
          </Button>
        </div>
        <p className="text-lg opacity-80">
          Manage child development professionals, therapists, and educators
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12" data-testid="text-loading">
          <p className="text-lg opacity-70">Loading professionals...</p>
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-12" data-testid="text-no-professionals">
          <p className="text-lg opacity-70">No professionals found. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {professionals.map((pro) => (
            <Card key={pro.id} className="bg-[#EDE9DC]" data-testid={`card-professional-${pro.id}`}>
              <CardContent className="p-6">
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(pro)}
                        data-testid={`button-edit-${pro.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(pro.id)}
                        data-testid={`button-delete-${pro.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Professional Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Professional</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dr. Jane Smith" data-testid="input-create-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Child Development Specialist" data-testid="input-create-specialty" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco, CA" data-testid="input-create-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="4.8" data-testid="input-create-rating" />
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
                      <Textarea {...field} placeholder="Board-certified pediatric therapist..." rows={4} data-testid="input-create-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="email" placeholder="contact@example.com" data-testid="input-create-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
                  Cancel
                </Button>
                <Button type="submit" className="bg-olive hover:bg-ochre" data-testid="button-submit-create">
                  Create Professional
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Professional Dialog */}
      <Dialog open={!!editingProfessional} onOpenChange={(open) => !open && setEditingProfessional(null)}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto bg-[#fff9ed]">
          <DialogHeader>
            <DialogTitle>Edit Professional</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dr. Jane Smith" data-testid="input-edit-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Child Development Specialist" data-testid="input-edit-specialty" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco, CA" data-testid="input-edit-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="4.8" data-testid="input-edit-rating" />
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
                      <Textarea {...field} placeholder="Board-certified pediatric therapist..." rows={4} data-testid="input-edit-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="email" placeholder="contact@example.com" data-testid="input-edit-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingProfessional(null)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" className="bg-olive hover:bg-ochre" data-testid="button-submit-edit">
                  Update Professional
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
