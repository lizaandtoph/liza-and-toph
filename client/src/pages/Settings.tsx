import { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CreditCard, Baby, Trash2, Save, X, Heart, Briefcase, ShoppingBag, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { calculateAgeFromBirthday, categorizeAgeBand } from '@shared/ageUtils';
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

export default function Settings() {
  const { 
    parentAccount, 
    updateParentAccount, 
    subscribed, 
    setSubscribed,
    children,
    updateChild,
    deleteChild,
    savedItems,
    removeSavedItem
  } = useStore();
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editingAccount, setEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstName: parentAccount?.firstName || '',
    lastName: parentAccount?.lastName || '',
    email: parentAccount?.email || '',
  });

  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [editingChild, setEditingChild] = useState<string | null>(null);
  const [childForm, setChildForm] = useState({ name: '', birthday: '' });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);

  const handleAccountUpdate = () => {
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

    updateParentAccount({
      firstName: accountForm.firstName,
      lastName: accountForm.lastName,
      email: accountForm.email
    });

    setEditingAccount(false);
    toast({
      title: 'Success',
      description: 'Account information updated'
    });
  };

  const handlePasswordUpdate = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.currentPassword !== parentAccount?.password) {
      toast({
        title: 'Error',
        description: 'Current password is incorrect',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    updateParentAccount({ password: passwordForm.newPassword });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setEditingPassword(false);
    toast({
      title: 'Success',
      description: 'Password updated successfully'
    });
  };

  const handleChildEdit = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setChildForm({ name: child.name, birthday: child.birthday || '' });
      setEditingChild(childId);
    }
  };

  const handleChildUpdate = () => {
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

  const handleCancelSubscription = () => {
    setSubscribed(false);
    toast({
      title: 'Subscription Cancelled',
      description: 'Your subscription has been cancelled'
    });
  };

  if (!parentAccount) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Please log in to access settings</p>
            <Button onClick={() => navigate('/login')} data-testid="button-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8" data-testid="heading-settings">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
          <TabsTrigger value="subscription" data-testid="tab-subscription">Subscription</TabsTrigger>
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
                      {parentAccount.firstName} {parentAccount.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="text-lg" data-testid="text-parent-email">{parentAccount.email}</p>
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
                          firstName: parentAccount.firstName,
                          lastName: parentAccount.lastName,
                          email: parentAccount.email
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
                <Lock className="w-5 h-5" />
                Password
              </CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editingPassword ? (
                <Button onClick={() => setEditingPassword(true)} data-testid="button-change-password">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      data-testid="input-current-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      data-testid="input-new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordUpdate} data-testid="button-save-password">
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingPassword(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      data-testid="button-cancel-password"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscribed ? (
                <div className="space-y-4">
                  <div className="p-4 bg-olive/10 rounded-lg border border-olive/20">
                    <p className="text-lg font-semibold text-olive mb-2" data-testid="text-subscription-status">
                      Active Subscription
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have full access to all features and content
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    data-testid="button-cancel-subscription"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-sand/30 rounded-lg border border-sand">
                    <p className="text-lg font-semibold mb-2" data-testid="text-subscription-status">
                      Free Plan
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to unlock all features and content
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-semibold">Monthly Plan</p>
                          <p className="text-sm text-muted-foreground">$4.99/month</p>
                        </div>
                        <Button onClick={() => setSubscribed(true)} data-testid="button-subscribe-monthly">
                          Subscribe
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-semibold">Annual Plan</p>
                          <p className="text-sm text-muted-foreground">$99/year (Save $60!)</p>
                        </div>
                        <Button onClick={() => setSubscribed(true)} data-testid="button-subscribe-annual">
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      <div className="flex items-center justify-between">
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
        <AlertDialogContent>
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
