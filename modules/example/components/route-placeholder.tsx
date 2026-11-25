import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

type RoutePlaceholderProps = {
  title: string;
  description: string;
  exampleHref: string;
  exampleLabel: string;
};

export function RoutePlaceholder({
  title,
  description,
  exampleHref,
  exampleLabel,
}: RoutePlaceholderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg border-border shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wrench className="size-6" aria-hidden="true" />
          </div>
          <div className="grid gap-2">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            className="h-12 w-full"
            nativeButton={false}
            render={<Link href={exampleHref} />}
          >
            {exampleLabel}
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
