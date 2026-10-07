import { Badge } from "@/components/ui/badge";

export function UniversityTypeBadge({
  type,
  withUniversity = false,
}: {
  type: string;
  withUniversity?: boolean;
}) {
  const isPublic = type === "public";
  return (
    <Badge variant={isPublic ? "safety" : "predicted"}>
      {isPublic ? "Public" : "Private"}
      {withUniversity ? " university" : ""}
    </Badge>
  );
}
