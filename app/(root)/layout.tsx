export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full font-opensans antialiased">
      <div className="flex size-full flex-col">{children}</div>
    </main>
  );
}
