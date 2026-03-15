"use client";

interface ParticipantInfo {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
}

interface TableInfo {
  tableId: string;
  numero: number;
  participants: ParticipantInfo[];
}

interface TableListProps {
  tables: TableInfo[];
  tourNumero: number;
}

export function TableList({ tables, tourNumero }: TableListProps) {
  return (
    <div className="space-y-4 overflow-y-auto lg:max-h-[calc(100vh-140px)]">
      <h2 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2 z-10">
        Tables — Tour {tourNumero}
      </h2>

      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="space-y-4 min-w-[320px]">
          {tables.map((table) => (
            <div
              key={table.tableId}
              className="bg-surface rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Table {table.numero}
                </h3>
                <span className="text-xs text-muted">
                  {table.participants.length} participants
                </span>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted uppercase tracking-wider">
                    <th className="text-left py-1">Nom</th>
                    <th className="text-left py-1">Pr&eacute;nom</th>
                    <th className="text-right py-1">N&deg;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {table.participants.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 text-sm text-foreground font-medium">{p.nom}</td>
                      <td className="py-2 text-sm text-muted">{p.prenom}</td>
                      <td className="py-2 text-sm text-right">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold">
                          {p.numero}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {tables.length === 0 && (
            <p className="text-sm text-muted text-center py-8">
              Aucune table pour ce tour.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
