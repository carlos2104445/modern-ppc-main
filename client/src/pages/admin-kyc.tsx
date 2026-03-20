import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { KYCReviewDialog } from "@/components/kyc-review-dialog";

export default function AdminKYC() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const kycSubmissions = [
    {
      id: "1",
      userId: "u1",
      userName: "John Doe",
      email: "john@example.com",
      status: "pending",
      submittedDate: "2024-01-15",
      documents: ["ID Front", "ID Back", "Proof of Address"],
    },
    {
      id: "2",
      userId: "u2",
      userName: "Jane Smith",
      email: "jane@example.com",
      status: "pending",
      submittedDate: "2024-01-14",
      documents: ["ID Front", "ID Back", "Proof of Address"],
    },
    {
      id: "3",
      userId: "u3",
      userName: "Bob Johnson",
      email: "bob@example.com",
      status: "approved",
      submittedDate: "2024-01-12",
      documents: ["ID Front", "ID Back", "Proof of Address"],
    },
  ];

  const statusColors = {
    pending: "bg-chart-4",
    approved: "bg-chart-2",
    rejected: "bg-destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage user verification submissions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {kycSubmissions.map((submission) => {
          const initials = submission.userName
            .split(" ")
            .map((n) => n[0])
            .join("");

          return (
            <Card key={submission.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={submission.userName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{submission.userName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{submission.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[submission.status as keyof typeof statusColors]}
                  >
                    {submission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Submitted Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {submission.documents.map((doc, index) => (
                      <Badge key={index} variant="secondary">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    Submitted: {submission.submittedDate}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setReviewDialogOpen(true);
                      }}
                      data-testid={`button-view-kyc-${submission.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedSubmission && (
        <KYCReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
}
