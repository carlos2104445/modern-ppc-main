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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailComposerDialog({ open, onOpenChange }: EmailComposerDialogProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const audienceOptions = [
    { value: "all", label: "All Users (12,453)", count: 12453 },
    { value: "premium", label: "Premium Members (3,456)", count: 3456 },
    { value: "earners", label: "Active Earners (8,234)", count: 8234 },
    { value: "advertisers", label: "Active Advertisers (2,145)", count: 2145 },
    { value: "new", label: "New Users (Last 30 days) (1,567)", count: 1567 },
  ];

  const handleSendNow = () => {
    if (!subject.trim() || !message.trim() || !audience) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedAudience = audienceOptions.find((opt) => opt.value === audience);
    console.log("Sending email:", {
      subject,
      message,
      audience,
      recipients: selectedAudience?.count,
    });

    toast({
      title: "Email sent",
      description: `Your message has been sent to ${selectedAudience?.count.toLocaleString()} users.`,
    });

    resetForm();
    onOpenChange(false);
  };

  const handleSchedule = () => {
    if (!subject.trim() || !message.trim() || !audience || !scheduleDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including schedule date.",
        variant: "destructive",
      });
      return;
    }

    const selectedAudience = audienceOptions.find((opt) => opt.value === audience);
    console.log("Scheduling email:", {
      subject,
      message,
      audience,
      scheduleDate,
      recipients: selectedAudience?.count,
    });

    toast({
      title: "Email scheduled",
      description: `Your message has been scheduled for ${scheduleDate}.`,
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setAudience("");
    setScheduleDate("");
    setIsScheduling(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Email
          </DialogTitle>
          <DialogDescription>Send emails or notifications to your users</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audience Selection */}
          <div>
            <Label htmlFor="audience">
              Audience <span className="text-destructive">*</span>
            </Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="audience" data-testid="select-email-audience">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {audience && (
              <p className="text-sm text-muted-foreground mt-1">
                Recipients:{" "}
                {audienceOptions.find((opt) => opt.value === audience)?.count.toLocaleString()}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="input-email-subject"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              data-testid="textarea-email-message"
            />
            <p className="text-sm text-muted-foreground mt-1">{message.length} characters</p>
          </div>

          {/* Schedule Options */}
          {isScheduling && (
            <div>
              <Label htmlFor="schedule">Schedule Date & Time</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                data-testid="input-schedule-date"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              data-testid="button-cancel-email"
            >
              Cancel
            </Button>
            {!isScheduling ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsScheduling(true)}
                  data-testid="button-schedule-email"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button
                  onClick={handleSendNow}
                  disabled={!subject || !message || !audience}
                  data-testid="button-send-email-now"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsScheduling(false)}
                  data-testid="button-cancel-schedule"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSchedule}
                  disabled={!subject || !message || !audience || !scheduleDate}
                  data-testid="button-confirm-schedule"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Confirm Schedule
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
