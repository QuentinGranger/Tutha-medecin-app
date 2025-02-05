'use client';

import { Providers } from './providers';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
