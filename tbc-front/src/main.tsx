import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
<<<<<<< HEAD
import { ThemeProvider } from 'next-themes'
=======
>>>>>>> origin/dev
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
<<<<<<< HEAD
      staleTime: 5 * 60 * 1000, // 5 minutes
=======
      staleTime: 0, // Always fetch fresh data
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
>>>>>>> origin/dev
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
<<<<<<< HEAD
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="theme"
          themes={['light', 'dark']}
        >
          <App />
          <Toaster position="top-right" />
        </ThemeProvider>
=======
        <App />
        <Toaster position="top-right" />
>>>>>>> origin/dev
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
