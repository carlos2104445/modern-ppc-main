import { useQuery } from "@tanstack/react-query";
import { type Faq } from "@shared/schema";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

  const publishedFaqs = useMemo(() => faqs.filter((faq) => faq.isPublished), [faqs]);

  const categories = useMemo(() => {
    const cats = new Set(publishedFaqs.map((faq) => faq.category));
    return ["all", ...Array.from(cats)];
  }, [publishedFaqs]);

  const filteredFaqs = useMemo(() => {
    return publishedFaqs.filter((faq) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [publishedFaqs, searchQuery, selectedCategory]);

  const groupedFaqs = useMemo(() => {
    const grouped: Record<string, Faq[]> = {};
    filteredFaqs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });
    return grouped;
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about AdConnect, our services, and how to get
              started.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Search and Filter */}
            <div className="mb-12 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  data-testid="input-faq-search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === "all" ? "All Categories" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Content */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="rounded-md border border-dashed py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No FAQs match your search." : "No FAQs available."}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                  <div key={category}>
                    <h2 className="mb-4 text-xl font-semibold">{category}</h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {categoryFaqs.map((faq) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          data-testid={`faq-item-${faq.id}`}
                          className="rounded-md border bg-card px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}

            {/* Contact Section */}
            <div className="mt-16 rounded-md border bg-muted/50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">Still have questions?</h3>
              <p className="mb-4 text-muted-foreground">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Button asChild data-testid="button-contact-support">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
              data-testid="link-home"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
              data-testid="link-about"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
              data-testid="link-blog"
            >
              Blog
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-foreground transition-colors"
              data-testid="link-privacy"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-foreground transition-colors"
              data-testid="link-terms"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookie-policy"
              className="hover:text-foreground transition-colors"
              data-testid="link-cookie"
            >
              Cookie Policy
            </Link>
            <Link
              href="/gdpr"
              className="hover:text-foreground transition-colors"
              data-testid="link-gdpr"
            >
              GDPR
            </Link>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AdConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
