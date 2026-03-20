import { GDPRManagement } from "@/components/gdpr-management";

export default function AdminGDPR() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GDPR Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user data in compliance with GDPR regulations
        </p>
      </div>

      <GDPRManagement />

      <div className="rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium mb-2">GDPR Compliance Information</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Users have the right to access their personal data</li>
          <li>• Users have the right to request deletion of their data</li>
          <li>• Data must be anonymized when retention is required but identification is not</li>
          <li>• All data operations are logged for audit purposes</li>
          <li>• Data exports include all personal information stored in the system</li>
        </ul>
      </div>
    </div>
  );
}
