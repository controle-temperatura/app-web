export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full md:flex md:justify-center md:bg-muted/30">
            <main className="w-full md:max-w-xl md:min-h-screen md:bg-background md:shadow-sm md:border-x md:border-border lg:max-w-2xl">
                <div className="mx-auto w-full max-w-full px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
