import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CreditCard, Building2, Plus, Trash2, Check, Star } from "lucide-react";
import { PaymentMethod } from "@shared/schema";
import { CardSkeletonLoader } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";

const formSchema = z.object({
  type: z.string().min(1, "Type is required"),
  cardholderName: z.string().optional(),
  lastFourDigits: z.string().min(4, "Last 4 digits required").max(4),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cardBrand: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);
  const [methodType, setMethodType] = useState<"card" | "bank">("card");

  const { data: methods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "card",
      lastFourDigits: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cardBrand: "",
      accountHolderName: "",
      bankName: "",
      accountType: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("/api/payment-methods", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return apiRequest(`/api/payment-methods/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setEditingMethod(null);
      toast({
        title: "Success",
        description: "Payment method updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment method",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/payment-methods/${id}`, "DELETE", undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setDeletingMethod(null);
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment method",
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/payment-methods/${id}/set-default`, "POST", undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set default payment method",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    form.reset({
      type: "card",
      lastFourDigits: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cardBrand: "",
      accountHolderName: "",
      bankName: "",
      accountType: "",
    });
    setMethodType("card");
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    form.reset({
      type: method.type,
      lastFourDigits: method.lastFourDigits,
      cardholderName: method.cardholderName || "",
      expiryMonth: method.expiryMonth || "",
      expiryYear: method.expiryYear || "",
      cardBrand: method.cardBrand || "",
      accountHolderName: method.accountHolderName || "",
      bankName: method.bankName || "",
      accountType: method.accountType || "",
    });
    setMethodType(method.type as "card" | "bank");
  };

  const onSubmit = (data: FormValues) => {
    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getCardBrandIcon = (brand?: string) => {
    if (!brand) return <CreditCard className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeletonLoader />
        <CardSkeletonLoader />
        <CardSkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Payment Methods
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="text-page-description">
            Manage your saved cards and bank accounts
          </p>
        </div>
        <Button onClick={handleCreate} data-testid="button-add-method">
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </div>

      {methods && methods.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment methods"
          description="Add a card or bank account to get started"
          onAction={handleCreate}
          actionLabel="Add Payment Method"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods?.map((method) => (
            <Card key={method.id} className="relative" data-testid={`card-method-${method.id}`}>
              {method.isDefault && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default" data-testid={`badge-default-${method.id}`}>
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {method.type === "card" ? (
                    <>
                      {getCardBrandIcon(method.cardBrand || "")}
                      <span data-testid={`text-card-brand-${method.id}`}>
                        {method.cardBrand || "Card"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5" />
                      <span data-testid={`text-bank-name-${method.id}`}>
                        {method.bankName || "Bank Account"}
                      </span>
                    </>
                  )}
                </CardTitle>
                <CardDescription data-testid={`text-last-four-${method.id}`}>
                  •••• {method.lastFourDigits}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {method.type === "card" ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Cardholder</p>
                        <p className="font-medium" data-testid={`text-cardholder-${method.id}`}>
                          {method.cardholderName || "N/A"}
                        </p>
                      </div>
                      {method.expiryMonth && method.expiryYear && (
                        <div>
                          <p className="text-sm text-muted-foreground">Expires</p>
                          <p className="font-medium" data-testid={`text-expiry-${method.id}`}>
                            {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Holder</p>
                        <p className="font-medium" data-testid={`text-account-holder-${method.id}`}>
                          {method.accountHolderName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Type</p>
                        <p className="font-medium" data-testid={`text-account-type-${method.id}`}>
                          {method.accountType || "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 pt-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(method.id)}
                        data-testid={`button-set-default-${method.id}`}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingMethod(method)}
                      data-testid={`button-delete-${method.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingMethod}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingMethod(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="max-w-md" data-testid="dialog-create-edit-method">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? "Update your payment method details"
                : "Add a new card or bank account"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setMethodType(value as "card" | "bank");
                      }}
                      disabled={!!editingMethod}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-method-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="bank">Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {methodType === "card" ? (
                <>
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-cardholder-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastFourDigits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last 4 Digits</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={4} data-testid="input-last-four" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Month</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="MM"
                              maxLength={2}
                              data-testid="input-expiry-month"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Year</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="YY"
                              maxLength={2}
                              data-testid="input-expiry-year"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="cardBrand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Brand</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-card-brand">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Mastercard">Mastercard</SelectItem>
                            <SelectItem value="Amex">American Express</SelectItem>
                            <SelectItem value="Discover">Discover</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-account-holder" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-bank-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastFourDigits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last 4 Digits of Account</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={4} data-testid="input-account-last-four" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-account-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Checking">Checking</SelectItem>
                            <SelectItem value="Savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingMethod(null);
                    form.reset();
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingMethod ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMethod} onOpenChange={() => setDeletingMethod(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMethod && deleteMutation.mutate(deletingMethod.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
