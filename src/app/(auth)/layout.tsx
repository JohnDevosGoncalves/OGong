import Logo from "@/components/layout/Logo";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Formulaire */}
      <div className="flex flex-col justify-between px-8 lg:px-16 xl:px-24 py-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <Logo size={36} />
            <span className="text-xl font-bold text-foreground tracking-tight">
              ogong
            </span>
          </div>
          <div className="flex flex-col justify-center flex-1">
            {children}
          </div>
        </div>
        <Footer />
      </div>

      {/* Illustration */}
      <div className="hidden lg:flex items-center justify-center bg-surface relative overflow-hidden">
        <div className="text-center px-12">
          <div className="flex justify-center mb-8">
            <Logo size={120} animate />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-3">Ogong</h2>
          <p className="text-lg text-muted font-medium mb-2 italic">
            Générateur de rencontres
          </p>
          <p className="text-muted/70 max-w-md mx-auto text-sm">
            Organisez vos événements de networking en quelques clics. Speed
            meetings, team building, job datings.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-border/20" />
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-border/20" />
      </div>
    </div>
  );
}
