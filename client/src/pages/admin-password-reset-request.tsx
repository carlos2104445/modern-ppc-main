import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetRequestSchema, type PasswordResetRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminPasswordResetRequest() {
  const { toast } = useToast();

  const form = useForm<PasswordResetRequest>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: PasswordResetRequest) => {
      const response = await apiRequest("/api/auth/password-reset-request", "POST", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Request received",
        description: data.message,
      });
      // Show the token in development mode
      if (data.token) {
        toast({
          title: "Development Token",
          description: `Your reset token: ${data.token}`,
          duration: 10000,
        });
      }
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to send password reset request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PasswordResetRequest) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-reset-request-title">Reset Password</CardTitle>
            <CardDescription data-testid="text-reset-request-description">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-reset-email">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="admin@adconnect.com"
                            className="pl-10"
                            data-testid="input-reset-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage data-testid="error-reset-email" />
                    </FormItem>
                  )}
                />

                <Alert className="bg-muted/50">
                  <AlertDescription className="text-sm" data-testid="text-reset-info">
                    For security reasons, we'll send a confirmation message even if the email
                    doesn't exist in our system.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetMutation.isPending}
                  data-testid="button-send-reset-link"
                >
                  {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t text-center">
              <Link href="/admin/login">
                <button
                  className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                  data-testid="link-back-to-login"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to login
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
