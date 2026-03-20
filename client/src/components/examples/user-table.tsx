import { UserTable } from "../user-table";

export default function UserTableExample() {
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      balance: "ETB 1,234.56",
      status: "active" as const,
      kycStatus: "approved" as const,
      joinDate: "2024-01-10",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      balance: "ETB 567.89",
      status: "active" as const,
      kycStatus: "pending" as const,
      joinDate: "2024-01-12",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.j@example.com",
      balance: "ETB 0.00",
      status: "suspended" as const,
      kycStatus: "rejected" as const,
      joinDate: "2024-01-08",
    },
  ];

  return (
    <div className="p-6">
      <UserTable users={users} />
    </div>
  );
}
