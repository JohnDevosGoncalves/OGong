export interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  detailColor?: string;
}

export function StatCard({ label, value, detail, detailColor }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {detail && (
        <p className={`text-sm mt-1 ${detailColor ?? "text-muted"}`}>
          {detail}
        </p>
      )}
    </div>
  );
}
