import Link from "next/link";
import { storeConfig } from "@/config/store.config";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    tienda: [
      { label: "Todos los productos", href: "/products" },
      { label: "Ofertas", href: "/products?sort=offers" },
      { label: "Novedades", href: "/products?sort=newest" },
    ],
    cuenta: [
      { label: "Mi cuenta", href: "/account" },
      { label: "Mis pedidos", href: "/orders" },
      { label: "Lista de deseos", href: "/wishlist" },
    ],
    info: [
      { label: "Sobre nosotros", href: "/about" },
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Política de privacidad", href: "/privacy" },
      { label: "Términos y condiciones", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)]"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-md)] flex items-center justify-center text-white text-sm font-bold">
                {storeConfig.name.charAt(0)}
              </div>
              {storeConfig.name}
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {storeConfig.description}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {storeConfig.social.instagram && (
                <a
                  href={storeConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-[var(--radius-md)] transition-all"
                >
                  <Instagram size={18} />
                </a>
              )}
              {storeConfig.social.facebook && (
                <a
                  href={storeConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-[var(--radius-md)] transition-all"
                >
                  <Facebook size={18} />
                </a>
              )}
              {storeConfig.social.twitter && (
                <a
                  href={storeConfig.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-[var(--radius-md)] transition-all"
                >
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Links: Tienda */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider mb-4">
              Tienda
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.tienda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Cuenta */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider mb-4">
              Mi cuenta
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.cuenta.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Mail size={16} className="text-[var(--color-primary)]" />
                {storeConfig.contact.email}
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Phone size={16} className="text-[var(--color-primary)]" />
                {storeConfig.contact.phone}
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <MapPin size={16} className="text-[var(--color-primary)]" />
                Argentina
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {currentYear} {storeConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.info.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
