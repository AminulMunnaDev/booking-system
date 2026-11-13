import { Badge } from "@/components/ui/badge";

const styles = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <Badge variant="secondary" className={styles[status]}>
      {status}
    </Badge>
  );
}
