export function MobileGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) {
  return (
    <div className={`grid gap-3 md:gap-4 grid-cols-${columns} md:grid-cols-4`}>
      {children}
    </div>
  );
}
