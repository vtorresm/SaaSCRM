# Frontend Architecture Guide (Next.js 14 + TypeScript)

## 1. App Router Architecture

### 1.1 Directory Structure
```
frontend/src/
├── app/
│   ├── (auth)/                    # Route Group: Authentication
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/               # Route Group: Protected Dashboard
│   │   ├── layout.tsx            # Protected layout with auth
│   │   ├── page.tsx              # Dashboard home
│   │   ├── clients/
│   │   │   └── page.tsx
│   │   ├── quotes/
│   │   │   ├── page.tsx          # Quotes list
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # Create quote
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Quote detail
│   │   ├── projects/
│   │   └── analytics/
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/    # NextAuth.js API routes
│   │   └── quotes/
│   │       └── [id]/
│   │           └── route.ts      # Quote API proxy
│   │
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/                       # Shadcn/UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── providers/
│       ├── query-provider.tsx
│       ├── auth-provider.tsx
│       └── theme-provider.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── hooks/
│   │   │   ├── use-login.ts
│   │   │   └── use-register.ts
│   │   ├── services/
│   │   │   └── auth-api.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── quotes/
│   │   ├── components/
│   │   │   ├── quote-builder.tsx
│   │   │   ├── quote-list.tsx
│   │   │   └── quote-item-form.tsx
│   │   ├── hooks/
│   │   │   ├── use-quotes.ts
│   │   │   ├── use-create-quote.ts
│   │   │   └── use-update-quote.ts
│   │   ├── services/
│   │   │   └── quotes-api.ts
│   │   ├── stores/
│   │   │   └── quote-builder-store.ts
│   │   └── types/
│   │       └── quotes.types.ts
│   │
│   └── clients/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Axios/fetch wrapper
│   │   ├── endpoints.ts          # API endpoint definitions
│   │   └── types.ts              # Shared API types
│   ├── utils/
│   │   ├── cn.ts                 # Class name utility
│   │   ├── date.ts               # Date utilities
│   │   └── format.ts             # Number/currency formatting
│   └── validations/
│       └── schemas.ts            # Zod validation schemas
│
└── stores/
    ├── auth-store.ts             # Zustand auth store
    └── ui-store.ts               # UI state store
```

### 1.2 App Router Implementation

#### Root Layout
```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sales CRM - Software Sales Management',
  description: 'Comprehensive CRM for software development sales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

#### Protected Dashboard Layout
```tsx
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 2. State Management Strategy

### 2.1 TanStack Query for Server State

#### Query Provider Setup
```tsx
// components/providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => {
              if (error?.status === 401) return false;
              return failureCount < 3;
            },
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### Custom Query Hooks
```tsx
// features/quotes/hooks/use-quotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../services/quotes-api';
import type { Quote, CreateQuoteDto, UpdateQuoteDto } from '../types/quotes.types';

export function useQuotes(params?: { clientId?: string; status?: string }) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => quotesApi.getQuotes(params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quotesApi.getQuote(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQuoteDto) => quotesApi.createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteDto }) =>
      quotesApi.updateQuote(id, data),
    onSuccess: (updatedQuote) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.setQueryData(['quotes', updatedQuote.id], updatedQuote);
    },
  });
}
```

### 2.2 Zustand for Client State

#### Auth Store
```tsx
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/features/auth/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

#### UI State Store
```tsx
// stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  theme: 'system',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
```

## 3. Quote Builder Feature

### 3.1 Complex Form Management
```tsx
// features/quotes/components/quote-builder.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateQuote } from '../hooks/use-quotes';
import { QuoteItemForm } from './quote-item-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const quoteSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  validUntil: z.date().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().positive('Quantity must be positive'),
      unitPrice: z.number().positive('Unit price must be positive'),
      serviceId: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export function QuoteBuilder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createQuote = useCreateQuote();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      await createQuote.mutateAsync({
        ...data,
        subtotal,
        taxAmount: tax,
        totalAmount: total,
      });
    } catch (error) {
      console.error('Failed to create quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Title</label>
            <Input {...register('title')} />
            {errors.title && (
              <span className="text-sm text-red-500">{errors.title.message}</span>
            )}
          </div>
          
          <div>
            <label>Description</label>
            <textarea
              {...register('description')}
              className="w-full p-2 border rounded"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote Items</CardTitle>
          <Button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <QuoteItemForm
                key={field.id}
                index={index}
                control={control}
                register={register}
                onRemove={() => remove(index)}
                errors={errors.items?.[index]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Quote'}
      </Button>
    </form>
  );
}
```

### 3.2 Service Catalog Integration
```tsx
// features/quotes/hooks/use-services.ts
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/features/services/services-api';

export function useServices(category?: string) {
  return useQuery({
    queryKey: ['services', category],
    queryFn: () => servicesApi.getServices({ category }),
    staleTime: 10 * 60 * 1000, // 10 minutes - services don't change often
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.getService(id),
    enabled: !!id,
  });
}
```

## 4. Performance Optimizations

### 4.1 React Server Components
```tsx
// app/(dashboard)/quotes/page.tsx
import { Suspense } from 'react';
import { QuoteList } from '@/features/quotes/components/quote-list';
import { QuoteListSkeleton } from '@/features/quotes/components/quote-list-skeleton';
import { getQuotes } from '@/features/quotes/services/quotes-api';

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: { client?: string; status?: string };
}) {
  // This runs on the server - no client-side data fetching needed
  const quotes = await getQuotes({
    clientId: searchParams.client,
    status: searchParams.status,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quotes</h1>
      
      <Suspense fallback={<QuoteListSkeleton />}>
        <QuoteList quotes={quotes} />
      </Suspense>
    </div>
  );
}
```

### 4.2 Image Optimization
```tsx
// components/ui/optimized-image.tsx
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
}

export function OptimizedImage({ src, fallback, ...props }: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    } else {
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-800">
        <span className="text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}
```

This frontend architecture provides a solid foundation with modern React patterns, efficient state management, and optimal performance.