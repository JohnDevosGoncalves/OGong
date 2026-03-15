import Logo from "@/components/layout/Logo";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header minimaliste pour l'écran d'événement */}
      <header className="h-14 bg-surface border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-sm font-bold text-foreground tracking-tight">
            ogong
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
