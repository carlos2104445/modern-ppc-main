import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Eye, ArrowRight } from "lucide-react";
import { type BlogPost } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  // Filter only published posts
  const publishedPosts = posts.filter((post) => post.status === "published");

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "Tips & Tricks",
    "Platform Updates",
    "Tutorials",
    "Market Insights",
    "Success Stories",
    "Reports",
    "Announcements",
  ];

  const handlePostClick = async (post: BlogPost) => {
    setSelectedPost(post);
    // Increment view count
    if (post.id) {
      try {
        await apiRequest(`/api/blog-posts/${post.id}/view`, "POST");
        // Invalidate cache to reflect updated view count
        queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      } catch (error) {
        console.error("Failed to increment view count:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">AdConnect Blog</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Tips, tutorials, and insights for PPC & PTC advertising
          </p>
        </div>
        {selectedPost && (
          <Button
            variant="outline"
            onClick={() => setSelectedPost(null)}
            data-testid="button-back-to-posts"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Posts
          </Button>
        )}
      </div>

      {selectedPost ? (
        /* Single Post View */
        <article className="max-w-4xl">
          <div className="mb-6">
            <Badge className="mb-4" data-testid="badge-category">
              {selectedPost.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-post-title">
              {selectedPost.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1" data-testid="text-author">
                <User className="h-4 w-4" />
                {selectedPost.author}
              </div>
              {selectedPost.publishedDate && (
                <div className="flex items-center gap-1" data-testid="text-date">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedPost.publishedDate).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-1" data-testid="text-views">
                <Eye className="h-4 w-4" />
                {selectedPost.views} views
              </div>
            </div>
          </div>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            data-testid="text-post-content"
          >
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {selectedPost.content || selectedPost.excerpt}
            </ReactMarkdown>
          </div>
        </article>
      ) : (
        /* Posts List View */
        <>
          {/* Filters */}
          <div className="mb-8">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[250px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-blog"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  data-testid="button-category-all"
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No blog posts found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover-elevate cursor-pointer flex flex-col"
                  onClick={() => handlePostClick(post)}
                  data-testid={`card-blog-${post.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" data-testid={`badge-category-${post.id}`}>
                        {post.category}
                      </Badge>
                      {post.featured && (
                        <Badge variant="default" data-testid={`badge-featured-${post.id}`}>
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2" data-testid={`text-title-${post.id}`}>
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p
                      className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1"
                      data-testid={`text-excerpt-${post.id}`}
                    >
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div
                        className="flex items-center gap-1"
                        data-testid={`text-author-${post.id}`}
                      >
                        <User className="h-3 w-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-3">
                        {post.publishedDate && (
                          <div
                            className="flex items-center gap-1"
                            data-testid={`text-date-${post.id}`}
                          >
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedDate).toLocaleDateString()}
                          </div>
                        )}
                        <div
                          className="flex items-center gap-1"
                          data-testid={`text-views-${post.id}`}
                        >
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
