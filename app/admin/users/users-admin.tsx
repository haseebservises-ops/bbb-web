// app/admin/users/users-admin.tsx (this is exactly your code)
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ... your ThreadRow/MemoryRow/UserRow types

export default function UsersAdmin() {
  const params = useSearchParams();
  const router = useRouter();
  const initialTab = (params.get("tab") as "activity"|"memory"|"manage") || "activity";
  const [tab, setTab] = useState<"activity"|"memory"|"manage">(initialTab);

  useEffect(() => {
    const usp = new URLSearchParams(params.toString());
    usp.set("tab", tab);
    router.replace(`?${usp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ... the rest of your ActivityTab / MemoryTab / ManageTab exactly as you have
}
