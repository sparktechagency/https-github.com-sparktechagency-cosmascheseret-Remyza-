// make it auth layout

// don't import anything

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="">{children}</div>
    </div>
  );
}
