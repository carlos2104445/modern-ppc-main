import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertSubscriptionPlanSchema,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
} from "@shared/schema";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CardSkeletonLoader } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(0, "Price must be a positive number"),
  billingCycle: z.string().optional(),
  features: z.string().min(1, "Features are required"),
  dailyAdViewLimit: z.coerce.number(),
  maxCampaigns: z.coerce.number(),
  maxActiveAds: z.coerce.number(),
  withdrawalFeeDiscount: z.string(),
  referralBonusMultiplier: z.string(),
  prioritySupport: z.boolean().optional(),
  adReviewPriority: z.boolean().optional(),
  status: z.string().optional(),
  displayOrder: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubscriptionPlansPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/admin/subscription-plans"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const features = data.features.split("\n").filter((f) => f.trim());
      const payload: InsertSubscriptionPlan = {
        name: data.name,
        description: data.description,
        price: data.price,
        billingCycle: data.billingCycle || "monthly",
        features,
        dailyAdViewLimit: data.dailyAdViewLimit,
        maxCampaigns: data.maxCampaigns,
        maxActiveAds: data.maxActiveAds,
        withdrawalFeeDiscount: data.withdrawalFeeDiscount,
        referralBonusMultiplier: data.referralBonusMultiplier,
        prioritySupport: data.prioritySupport || false,
        adReviewPriority: data.adReviewPriority || false,
        status: data.status || "active",
        displayOrder: data.displayOrder,
      };
      return apiRequest("/api/admin/subscription-plans", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription plan",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      const features = data.features.split("\n").filter((f) => f.trim());
      const payload: Partial<InsertSubscriptionPlan> = {
        name: data.name,
        description: data.description,
        price: data.price,
        billingCycle: data.billingCycle || "monthly",
        features,
        dailyAdViewLimit: data.dailyAdViewLimit,
        maxCampaigns: data.maxCampaigns,
        maxActiveAds: data.maxActiveAds,
        withdrawalFeeDiscount: data.withdrawalFeeDiscount,
        referralBonusMultiplier: data.referralBonusMultiplier,
        prioritySupport: data.prioritySupport || false,
        adReviewPriority: data.adReviewPriority || false,
        status: data.status || "active",
        displayOrder: data.displayOrder,
      };
      return apiRequest(`/api/admin/subscription-plans/${id}`, "PATCH", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setEditingPlan(null);
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/subscription-plans/${id}`, "DELETE", null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setDeletingPlan(null);
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription plan",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0.00",
      billingCycle: "monthly",
      features: "",
      dailyAdViewLimit: 0,
      maxCampaigns: 0,
      maxActiveAds: 0,
      withdrawalFeeDiscount: "0",
      referralBonusMultiplier: "1.00",
      prioritySupport: false,
      adReviewPriority: false,
      status: "active",
      displayOrder: 0,
    },
  });

  const handleCreate = () => {
    form.reset();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    form.reset({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      features: plan.features.join("\n"),
      dailyAdViewLimit: plan.dailyAdViewLimit,
      maxCampaigns: plan.maxCampaigns,
      maxActiveAds: plan.maxActiveAds,
      withdrawalFeeDiscount: plan.withdrawalFeeDiscount,
      referralBonusMultiplier: plan.referralBonusMultiplier,
      prioritySupport: plan.prioritySupport,
      adReviewPriority: plan.adReviewPriority,
      status: plan.status,
      displayOrder: plan.displayOrder,
    });
    setEditingPlan(plan);
  };

  const onSubmit = (data: FormValues) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground">Manage subscription plans and pricing</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeletonLoader />
          <CardSkeletonLoader />
          <CardSkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-subscription-plans">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">Manage subscription plans and pricing tiers</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-plan">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {!plans || plans.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No subscription plans"
          description="Create your first subscription plan to get started"
          actionLabel="Create Plan"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      <Badge
                        variant={plan.status === "active" ? "default" : "secondary"}
                        data-testid={`badge-status-${plan.id}`}
                      >
                        {plan.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold">ETB {parseFloat(plan.price).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">per {plan.billingCycle}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-sm">Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Daily Ad Views</p>
                    <p className="font-medium">
                      {plan.dailyAdViewLimit === -1 ? "Unlimited" : plan.dailyAdViewLimit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Campaigns</p>
                    <p className="font-medium">
                      {plan.maxCampaigns === -1 ? "Unlimited" : plan.maxCampaigns}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Active Ads</p>
                    <p className="font-medium">
                      {plan.maxActiveAds === -1 ? "Unlimited" : plan.maxActiveAds}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fee Discount</p>
                    <p className="font-medium">{plan.withdrawalFeeDiscount}%</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                    data-testid={`button-edit-${plan.id}`}
                    className="flex-1"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingPlan(plan)}
                    data-testid={`button-delete-${plan.id}`}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isCreateDialogOpen || editingPlan !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingPlan(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-plan">
              {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the subscription plan details"
                : "Add a new subscription plan with pricing and features"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Premium" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Perfect for..."
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (ETB)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="299.00"
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Cycle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-billing-cycle">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features (one per line)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="50 ads per day&#10;Priority support&#10;10% fee discount"
                        rows={4}
                        data-testid="textarea-features"
                      />
                    </FormControl>
                    <FormDescription>Enter each feature on a new line</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="dailyAdViewLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Ad Views (-1 = unlimited)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="input-daily-ad-limit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCampaigns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Campaigns (-1 = unlimited)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="input-max-campaigns" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxActiveAds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Active Ads (-1 = unlimited)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="input-max-ads" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="withdrawalFeeDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Fee Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-fee-discount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralBonusMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Bonus Multiplier</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="1.50"
                          data-testid="input-referral-multiplier"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="input-display-order" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="prioritySupport"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Priority Support</FormLabel>
                        <FormDescription className="text-xs">
                          24/7 priority customer support
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-priority-support"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adReviewPriority"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Ad Review Priority</FormLabel>
                        <FormDescription className="text-xs">
                          Faster ad approval process
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-ad-review-priority"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingPlan(null);
                  }}
                  data-testid="button-cancel-plan"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-plan"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingPlan
                      ? "Update Plan"
                      : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deletingPlan !== null} onOpenChange={(open) => !open && setDeletingPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-delete">Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingPlan?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingPlan(null)}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingPlan && deleteMutation.mutate(deletingPlan.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
