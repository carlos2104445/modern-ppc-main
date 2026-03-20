import { ReferralTree } from "../referral-tree";

export default function ReferralTreeExample() {
  const referrals = [
    {
      id: "1",
      name: "Alice Johnson",
      earnings: "ETB 125.50",
      level: 1,
      children: [
        {
          id: "2",
          name: "Bob Smith",
          earnings: "ETB 45.20",
          level: 2,
          children: [
            {
              id: "3",
              name: "Charlie Brown",
              earnings: "ETB 12.30",
              level: 3,
            },
          ],
        },
        {
          id: "4",
          name: "Diana Prince",
          earnings: "ETB 78.90",
          level: 2,
        },
      ],
    },
    {
      id: "5",
      name: "Eve Wilson",
      earnings: "ETB 89.40",
      level: 1,
    },
  ];

  return (
    <div className="p-6 max-w-3xl">
      <ReferralTree referrals={referrals} />
    </div>
  );
}
