import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <nav className="px-4 py-3 border-b border-zinc-200">
          <div className="mx-auto max-w-5xl flex items-center gap-4">
            <Link to="/" className="font-bold">TEAM-TBC</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
