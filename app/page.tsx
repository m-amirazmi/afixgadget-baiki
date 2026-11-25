import { RoutePlaceholder } from "@/modules/example/components/route-placeholder";

export default function Home() {
  return (
    <RoutePlaceholder
      description="The production home screen is reserved for the upcoming application UI."
      exampleHref="/example"
      exampleLabel="View POS example"
      title="Home page placeholder"
    />
  );
}
