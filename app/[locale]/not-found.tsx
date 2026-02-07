import Link from 'next/link';
import { headers } from 'next/headers';

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        {pathname && (
          <p className="mb-4 text-sm text-muted-foreground font-mono">
            Path: {pathname}
          </p>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
