import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-5xl font-semibold">404</p>
      <p className="mt-2 text-muted-foreground">We could not find that page or lesson.</p>
      <Link href="/lessons" className={buttonVariants({ className: "mt-6" })}>
        Browse lessons
      </Link>
    </div>
  );
}
