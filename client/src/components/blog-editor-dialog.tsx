import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { type BlogPost } from "@shared/schema";

interface BlogEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => void;
}

export function BlogEditorDialog({ open, onOpenChange, post, onSave }: BlogEditorDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    status: "draft" as "published" | "draft" | "scheduled",
    publishedDate: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    featured: false,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        author: post.author || "",
        category: post.category || "",
        status: (post.status as any) || "draft",
        publishedDate: post.publishedDate || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        featured: post.featured || false,
      });
    } else {
      setFormData({
        title: "",
        author: "",
        category: "",
        status: "draft",
        publishedDate: "",
        excerpt: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
        featured: false,
      });
    }
  }, [post, open]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the blog post.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.author.trim()) {
      toast({
        title: "Author required",
        description: "Please enter the author name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.excerpt.trim()) {
      toast({
        title: "Excerpt required",
        description: "Please enter a brief excerpt.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      ...formData,
      metaTitle: formData.metaTitle || formData.title,
      metaDescription: formData.metaDescription || formData.excerpt,
    });
    onOpenChange(false);
  };

  const categories = [
    "Tips & Tricks",
    "Platform Updates",
    "Tutorials",
    "Market Insights",
    "Success Stories",
    "Reports",
    "Announcements",
  ];

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Write your blog post content here...",
      status: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
      ] as any,
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
          <DialogDescription>
            {post
              ? "Update blog post details and content"
              : "Fill in the details to create a new blog post"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter blog post title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-testid="input-blog-title"
            />
          </div>

          {/* Author and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                data-testid="input-blog-author"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" data-testid="select-blog-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status" data-testid="select-blog-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input
                id="publishDate"
                type="date"
                value={formData.publishedDate}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                data-testid="input-blog-date"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt * (for preview cards)</Label>
            <Input
              id="excerpt"
              placeholder="Write a brief excerpt or summary (1-2 sentences)..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              data-testid="input-blog-excerpt"
            />
          </div>

          {/* SEO Fields */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-medium">SEO Metadata (optional)</h3>
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                placeholder="SEO title (defaults to post title)"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                data-testid="input-meta-title"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Input
                id="metaDescription"
                placeholder="SEO description (defaults to excerpt)"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                data-testid="input-meta-description"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <Label>Content (Markdown supported)</Label>
            <div className="mt-2" data-testid="editor-blog-content">
              <SimpleMDE
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                options={editorOptions}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-blog"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-blog">
            <Save className="h-4 w-4 mr-2" />
            {post ? "Update Post" : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
