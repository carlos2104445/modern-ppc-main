import { useQuery } from "@tanstack/react-query";
import { type Faq, insertFaqSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFAQs() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

  const form = useForm({
    resolver: zodResolver(insertFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "",
      order: 0,
      isPublished: true,
    },
  });

  const handleOpenDialog = (faq?: Faq) => {
    if (faq) {
      setEditingFaq(faq);
      form.reset({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        isPublished: faq.isPublished,
      });
    } else {
      setEditingFaq(null);
      form.reset({
        question: "",
        answer: "",
        category: "",
        order: faqs.length,
        isPublished: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFaq(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingFaq) {
        await apiRequest(`/api/faqs/${editingFaq.id}`, "PATCH", data);
        toast({
          title: "FAQ updated",
          description: "The FAQ has been updated successfully.",
        });
      } else {
        await apiRequest("/api/faqs", "POST", data);
        toast({
          title: "FAQ created",
          description: "The FAQ has been created successfully.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save FAQ. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;

    try {
      await apiRequest(`/api/faqs/${faqToDelete.id}`, "DELETE");
      toast({
        title: "FAQ deleted",
        description: "The FAQ has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-create-faq">
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No FAQs yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Card key={faq.id} data-testid={`faq-card-${faq.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      {faq.isPublished ? (
                        <Eye
                          className="h-4 w-4 text-green-600"
                          data-testid={`icon-published-${faq.id}`}
                        />
                      ) : (
                        <EyeOff
                          className="h-4 w-4 text-muted-foreground"
                          data-testid={`icon-unpublished-${faq.id}`}
                        />
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      Category: {faq.category} • Order: {faq.order}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(faq)}
                      data-testid={`button-edit-faq-${faq.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setFaqToDelete(faq);
                        setDeleteDialogOpen(true);
                      }}
                      data-testid={`button-delete-faq-${faq.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-faq">
              {editingFaq ? "Edit FAQ" : "Create FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editingFaq
                ? "Update the FAQ details below."
                : "Add a new frequently asked question."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="What is your question?"
                        data-testid="input-question"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide a clear and helpful answer..."
                        rows={6}
                        data-testid="input-answer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Getting Started">Getting Started</SelectItem>
                          <SelectItem value="Payments">Payments</SelectItem>
                          <SelectItem value="Advertising">Advertising</SelectItem>
                          <SelectItem value="Referrals">Referrals</SelectItem>
                          <SelectItem value="Account">Account</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          {categories
                            .filter(
                              (c) =>
                                ![
                                  "Getting Started",
                                  "Payments",
                                  "Advertising",
                                  "Referrals",
                                  "Account",
                                  "Technical",
                                ].includes(c)
                            )
                            .map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-order"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this FAQ visible to users
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-published"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  data-testid="button-cancel-faq"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-faq">
                  {editingFaq ? "Update" : "Create"} FAQ
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setFaqToDelete(null);
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
