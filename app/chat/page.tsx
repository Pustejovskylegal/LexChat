import { Suspense } from "react";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

export default function ChatPage() {
return (
<Suspense fallback={<div className="p-4">Načítám chat…</div>}>
<ChatClient />
</Suspense>
);
}