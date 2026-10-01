import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={FileQuestion}
        title="This page doesn't exist"
        description="The link may be broken, or the page may have been removed."
        action={
          <Button asChild>
            <Link href="/">Go to home</Link>
          </Button>
        }
      />
    </div>
  );
}
