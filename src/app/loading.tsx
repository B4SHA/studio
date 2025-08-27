import { Icons } from "@/components/icons";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Icons.spinner className="h-12 w-12 text-primary" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}
