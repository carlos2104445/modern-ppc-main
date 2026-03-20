import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetConfirmSchema, type PasswordResetConfirm } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, KeyRound } from "lucide-react";

export default function AdminPasswordResetConfirm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<PasswordResetConfirm>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: {
      token: "",
      password: "",
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (data: PasswordResetConfirm) => {
      const response = await apiRequest("/api/auth/password-reset-confirm", "POST", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "You can now login with your new password",
      });
      setLocation("/admin/login");
    },
    onError: (error: any) => {
      toast({
        title: "Password reset failed",
        description: error.message || "Invalid or expired token",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PasswordResetConfirm) => {
    confirmMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-reset-confirm-title">Set New Password</CardTitle>
            <CardDescription data-testid="text-reset-confirm-description">
              Enter your reset token and choose a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-reset-token">Reset Token</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter your reset token"
                            className="pl-10"
                            data-testid="input-reset-token"
                          />
                        </div>
                      </FormControl>
                      <FormMessage data-testid="error-reset-token" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-new-password">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            data-testid="input-new-password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage data-testid="error-new-password" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={confirmMutation.isPending}
                  data-testid="button-reset-password"
                >
                  {confirmMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
