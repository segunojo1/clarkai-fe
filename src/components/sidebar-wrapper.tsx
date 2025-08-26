import { SidebarProvider } from './ui/sidebar';

interface SidebarWrapperProps {
  children: React.ReactNode;
  params?: { id?: string }; // adjust based on your route structure
}

export function SidebarWrapper({ children, params }: SidebarWrapperProps) {
  // Assuming your route structure is /workspaces/:id or similar
  const isWorkspaceDetailPage = Boolean(params?.id);

  return (
    <SidebarProvider defaultOpen={isWorkspaceDetailPage}>
      {children}
    </SidebarProvider>
  );
}
