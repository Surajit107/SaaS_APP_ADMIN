import { BrowserRouter } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppRoutes } from '@/routes';

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppRoutes />
        <Toaster position="top-center" />
      </TooltipProvider>
    </BrowserRouter>
  );
}
