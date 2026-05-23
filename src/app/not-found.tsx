import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="text-center space-y-6 max-w-md animate-slide-up">
        <div className="text-8xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Página no encontrada
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Lo sentimos, la página que estás buscando no existe o fue movida.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button>
              <Home size={16} />
              Volver al inicio
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft size={16} />
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
