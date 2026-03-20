import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Link, Youtube, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const { toast } = useToast();
  const [adType, setAdType] = useState("link");
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [cpc, setCpc] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const handleSubmit = () => {
    if (!campaignName || !budget || !cpc) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (adType === "link" && !targetUrl) {
      toast({
        title: "Missing URL",
        description: "Please provide a target URL for your ad.",
        variant: "destructive",
      });
      return;
    }

    if (adType === "youtube" && !youtubeUrl) {
      toast({
        title: "Missing video",
        description: "Please provide a YouTube video URL.",
        variant: "destructive",
      });
      return;
    }

    if (adType === "banner" && !bannerUrl) {
      toast({
        title: "Missing image",
        description: "Please upload or provide a banner image URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: campaignName,
          type: adType,
          description,
          url: adType === "link" ? targetUrl : adType === "youtube" ? youtubeUrl : bannerUrl,
          imageUrl: adType === "banner" ? bannerUrl : undefined,
          budget,
          cpc,
          duration: 15,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Campaign creation failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Campaign created!",
        description: `Your ${adType} campaign "${campaignName}" has been submitted for review. ETB ${budget} has been placed in escrow.`,
      });

      // Reset form
      setCampaignName("");
      setDescription("");
      setTargetUrl("");
      setYoutubeUrl("");
      setBannerUrl("");
      setBudget("");
      setCpc("");
      setTargetAudience("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Choose your ad type and configure your campaign settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Type Selection */}
          <div>
            <Label className="mb-3 block">
              Ad Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <Card
                className={`p-4 cursor-pointer hover-elevate ${adType === "link" ? "border-primary border-2" : ""}`}
                onClick={() => setAdType("link")}
                data-testid="card-ad-type-link"
              >
                <div className="flex flex-col items-center gap-2">
                  <Link className="h-8 w-8" />
                  <p className="font-medium">Link Ad</p>
                  <p className="text-xs text-muted-foreground text-center">
                    Direct users to your website
                  </p>
                </div>
              </Card>
              <Card
                className={`p-4 cursor-pointer hover-elevate ${adType === "youtube" ? "border-primary border-2" : ""}`}
                onClick={() => setAdType("youtube")}
                data-testid="card-ad-type-youtube"
              >
                <div className="flex flex-col items-center gap-2">
                  <Youtube className="h-8 w-8" />
                  <p className="font-medium">YouTube Video</p>
                  <p className="text-xs text-muted-foreground text-center">Embed a YouTube video</p>
                </div>
              </Card>
              <Card
                className={`p-4 cursor-pointer hover-elevate ${adType === "banner" ? "border-primary border-2" : ""}`}
                onClick={() => setAdType("banner")}
                data-testid="card-ad-type-banner"
              >
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8" />
                  <p className="font-medium">Banner Image</p>
                  <p className="text-xs text-muted-foreground text-center">Display image banner</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">
                  Campaign Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Summer Sale 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  data-testid="input-campaign-name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your campaign..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-testid="input-description"
                />
              </div>

              {adType === "link" && (
                <div>
                  <Label htmlFor="target-url">
                    Target URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="target-url"
                    type="url"
                    placeholder="https://your-website.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    data-testid="input-target-url"
                  />
                </div>
              )}

              {adType === "youtube" && (
                <div>
                  <Label htmlFor="youtube-url">
                    YouTube Video URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    data-testid="input-youtube-url"
                  />
                </div>
              )}

              {adType === "banner" && (
                <div>
                  <Label htmlFor="banner-url">
                    Banner Image URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="banner-url"
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    data-testid="input-banner-url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Or click to upload an image</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    data-testid="button-upload-banner"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="budget">
                  Total Budget (ETB) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  data-testid="input-budget"
                />
              </div>

              <div>
                <Label htmlFor="cpc">
                  Cost Per Click (ETB) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cpc"
                  type="number"
                  step="0.01"
                  placeholder="0.50"
                  value={cpc}
                  onChange={(e) => setCpc(e.target.value)}
                  data-testid="input-cpc"
                />
              </div>

              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger id="target-audience" data-testid="select-target-audience">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="new">New Users</SelectItem>
                    <SelectItem value="active">Active Earners</SelectItem>
                    <SelectItem value="premium">Premium Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div>
              <Label className="mb-3 block">Preview</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                {adType === "link" && targetUrl && (
                  <div className="text-center space-y-3">
                    <Link className="h-16 w-16 mx-auto text-primary" />
                    <p className="font-semibold">{campaignName || "Campaign Name"}</p>
                    <p className="text-sm text-muted-foreground">
                      {description || "Campaign description"}
                    </p>
                    <p className="text-xs text-primary break-all">{targetUrl}</p>
                  </div>
                )}
                {adType === "youtube" && youtubeUrl && getYoutubeEmbedUrl(youtubeUrl) && (
                  <div className="w-full space-y-3">
                    <iframe
                      width="100%"
                      height="250"
                      src={getYoutubeEmbedUrl(youtubeUrl)}
                      title="YouTube video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                    <p className="font-semibold text-center">{campaignName || "Campaign Name"}</p>
                  </div>
                )}
                {adType === "banner" && bannerUrl && (
                  <div className="w-full space-y-3">
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-auto rounded-lg"
                    />
                    <p className="font-semibold text-center">{campaignName || "Campaign Name"}</p>
                  </div>
                )}
                {((adType === "link" && !targetUrl) ||
                  (adType === "youtube" && !youtubeUrl) ||
                  (adType === "banner" && !bannerUrl)) && (
                  <p className="text-muted-foreground text-center">Preview will appear here</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-campaign"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-submit-campaign">
              Create Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
