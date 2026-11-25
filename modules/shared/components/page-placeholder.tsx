import { ArrowRight, Construction, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PagePlaceholderProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  hint?: string;
};

export function PagePlaceholder({
  title,
  description,
  icon: Icon = Construction,
  hint = "This workflow is part of the upcoming workspace experience.",
}: PagePlaceholderProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">AFIX GADGET · WORKSPACE</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
        <Badge className="h-8 rounded-full px-3" variant="outline">
          Layout preview
        </Badge>
      </div>

      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-foreground">
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <div className="grid gap-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            <ArrowRight className="size-4 text-primary" aria-hidden="true" />
            {hint}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
