import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { User, Mail, Lock, Baby, Trash2, Save, X, Heart, Briefcase, ShoppingBag, Edit2, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { calculateAgeFromBirthday, categorizeAgeBand } from '@shared/ageUtils';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CURRENT_QUESTIONNAIRE_VERSION = 2;

export default function Settings() {
  const { 
    children,
    updateChild,
    deleteChild,
    savedItems,
    removeSavedItem,
    getAnswers
  } = useStore();
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Early access period - all users have full access through January 2026

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const [editingAccount, setEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);


  const [editingChild, setEditingChild] = useState<string | null>(null);
  const [childForm, setChildForm] = useState({ name: '', birthday: '' });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);

  const handleAccountUpdate = async () => {
    if (!accountForm.firstName || !accountForm.lastName || !accountForm.email) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    if (!accountForm.email.includes('@')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('PATCH', '/api/auth/account', {
        firstName: accountForm.firstName,
        lastName: accountForm.lastName,
        email: accountForm.email
      });

      setEditingAccount(false);
      toast({
        title: 'Success',
        description: 'Account information updated'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account',
        variant: 'destructive'
      });
    }
  };


  const handleChildEdit = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setChildForm({ name: child.name, birthday: child.birthday || '' });
      setEditingChild(childId);
    }
  };

  const handleChildUpdate = async () => {
    if (!childForm.name || !childForm.birthday) {
      toast({
        title: 'Error',
        description: 'Name and birthday are required',
        variant: 'destructive'
      });
      return;
    }

    const { years, months, totalMonths } = calculateAgeFromBirthday(childForm.birthday);
    const ageBand = categorizeAgeBand(totalMonths);

    try {
      // Update in database first
      await apiRequest('PATCH', `/api/child-profiles/${editingChild}`, {
        name: childForm.name,
        birthday: childForm.birthday,
        ageYears: years,
        ageMonths: months,
        ageBand
      });

      // Then update local state
      updateChild(editingChild!, {
        name: childForm.name,
        birthday: childForm.birthday,
        ageYears: years,
        ageMonths: months,
        ageBand
      });

      setEditingChild(null);
      toast({
        title: 'Success',
        description: 'Child profile updated'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update child profile',
        variant: 'destructive'
      });
    }
  };

  const confirmDeleteChild = (childId: string) => {
    setChildToDelete(childId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteChild = () => {
    if (childToDelete) {
      deleteChild(childToDelete);
      setDeleteDialogOpen(false);
      setChildToDelete(null);
      toast({
        title: 'Success',
        description: 'Child profile removed'
      });
    }
  };


  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect happens via useEffect, this is just a safety check
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8" data-testid="heading-settings">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
          <TabsTrigger value="children" data-testid="tab-children">Children</TabsTrigger>
          <TabsTrigger value="saved" data-testid="tab-saved">Saved Items</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your name and email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editingAccount ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="text-lg" data-testid="text-parent-name">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="text-lg" data-testid="text-parent-email">{user.email}</p>
                  </div>
                  <Button onClick={() => setEditingAccount(true)} data-testid="button-edit-account">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Information
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={accountForm.firstName}
                        onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={accountForm.lastName}
                        onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAccountUpdate} data-testid="button-save-account">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingAccount(false);
                        setAccountForm({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || ''
                        });
                      }}
                      data-testid="button-cancel-account"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Early Access Status
              </CardTitle>
              <CardDescription>Your subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-olive/10 to-blush/10 border-2 border-olive/20 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-olive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Free Early Access Active</h3>
                    <p className="text-muted-foreground mb-3">
                      You have full, unrestricted access to all Liza & Toph features through <strong>January 2026</strong> as part of our early access program.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      After the early access period ends, a subscription will be required to continue using the platform. We'll notify you well in advance.
                    </p>
                  </div>
                </div>
                <a 
                  href="https://app-feedback.lizaandtoph.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button 
                    className="w-full sm:w-auto bg-[#4a5942] text-[#fff9ed] hover:bg-[#3d4a37] transition-colors" 
                    data-testid="button-provide-feedback"
                  >
                    Share Your Feedback
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="children" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="w-5 h-5" />
                Manage Children
              </CardTitle>
              <CardDescription>Edit or remove child profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {children.length === 0 ? (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-children">
                  No children added yet. Add your first child to get started!
                </p>
              ) : (
                children.map((child) => (
                  <div key={child.id} className="p-4 border rounded-lg" data-testid={`card-child-${child.id}`}>
                    {editingChild === child.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`child-name-${child.id}`}>Name</Label>
                          <Input
                            id={`child-name-${child.id}`}
                            value={childForm.name}
                            onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                            data-testid={`input-child-name-${child.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`child-birthday-${child.id}`}>Birthday</Label>
                          <Input
                            id={`child-birthday-${child.id}`}
                            type="date"
                            value={childForm.birthday}
                            onChange={(e) => setChildForm({ ...childForm, birthday: e.target.value })}
                            data-testid={`input-child-birthday-${child.id}`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleChildUpdate} size="sm" data-testid={`button-save-child-${child.id}`}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingChild(null)}
                            data-testid={`button-cancel-child-${child.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg" data-testid={`text-child-name-${child.id}`}>
                              {child.name}
                            </p>
                            {child.ageBand && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-child-age-${child.id}`}>
                                Age: {child.ageYears}y {child.ageMonths}m ({child.ageBand})
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleChildEdit(child.id)}
                              data-testid={`button-edit-child-${child.id}`}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => confirmDeleteChild(child.id)}
                              data-testid={`button-delete-child-${child.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        {(() => {
                          const answers = getAnswers(child.id);
                          const currentVersion = answers?.questionnaire_version || 1;
                          const isOutdated = currentVersion < CURRENT_QUESTIONNAIRE_VERSION;
                          
                          return (
                            <div className={`p-3 rounded-lg border-2 ${isOutdated ? 'bg-ochre/10 border-ochre' : 'bg-green-50 border-green-500'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isOutdated ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 text-ochre" />
                                      <div>
                                        <p className="font-medium text-sm">Questionnaire Update Available</p>
                                        <p className="text-xs text-muted-foreground">
                                          Version {currentVersion} → {CURRENT_QUESTIONNAIRE_VERSION}
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <div>
                                        <p className="font-medium text-sm">Questionnaire Up to Date</p>
                                        <p className="text-xs text-muted-foreground">
                                          Version {currentVersion}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {isOutdated && (
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    onClick={() => setLocation('/onboarding')}
                                    className="bg-ochre hover:bg-burnt"
                                    data-testid={`button-retake-questionnaire-${child.id}`}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Update
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Saved Brands
              </CardTitle>
              <CardDescription>Your favorited brands</CardDescription>
            </CardHeader>
            <CardContent>
              {savedItems.brands.length === 0 ? (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-saved-brands">
                  No saved brands yet
                </p>
              ) : (
                <div className="space-y-2">
                  {savedItems.brands.map((brand, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded" data-testid={`item-brand-${index}`}>
                      <span>{brand}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSavedItem('brands', brand)}
                        data-testid={`button-remove-brand-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Saved Professionals
              </CardTitle>
              <CardDescription>Your favorited professionals</CardDescription>
            </CardHeader>
            <CardContent>
              {savedItems.professionals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-saved-professionals">
                  No saved professionals yet
                </p>
              ) : (
                <div className="space-y-2">
                  {savedItems.professionals.map((professional, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded" data-testid={`item-professional-${index}`}>
                      <span>{professional}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSavedItem('professionals', professional)}
                        data-testid={`button-remove-professional-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Saved Products
              </CardTitle>
              <CardDescription>Your favorited products</CardDescription>
            </CardHeader>
            <CardContent>
              {savedItems.products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-saved-products">
                  No saved products yet
                </p>
              ) : (
                <div className="space-y-2">
                  {savedItems.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded" data-testid={`item-product-${index}`}>
                      <span>{product}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSavedItem('products', product)}
                        data-testid={`button-remove-product-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg bg-[#fff9ed]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this child's profile and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChild} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
