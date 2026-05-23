export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-primary-bg)] to-[var(--color-bg-secondary)] p-4">
      {children}
    </div>
  );
}
