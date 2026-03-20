import { TransactionTable } from "../transaction-table";

export default function TransactionTableExample() {
  const transactions = [
    {
      id: "1",
      type: "deposit" as const,
      amount: "ETB 100.00",
      description: "PayPal deposit",
      status: "completed" as const,
      date: "2024-01-15 10:30 AM",
    },
    {
      id: "2",
      type: "click_earning" as const,
      amount: "ETB 0.05",
      description: "Ad click reward",
      status: "completed" as const,
      date: "2024-01-15 09:15 AM",
    },
    {
      id: "3",
      type: "referral_commission" as const,
      amount: "ETB 2.50",
      description: "Level 1 referral commission",
      status: "completed" as const,
      date: "2024-01-14 03:20 PM",
    },
    {
      id: "4",
      type: "withdrawal" as const,
      amount: "ETB 50.00",
      description: "Bank transfer",
      status: "pending" as const,
      date: "2024-01-14 11:00 AM",
    },
  ];

  return (
    <div className="p-6">
      <TransactionTable transactions={transactions} />
    </div>
  );
}
