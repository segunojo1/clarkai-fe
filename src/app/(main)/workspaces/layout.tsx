import type { Metadata } from "next"
import "@/app/globals.css"
import WorkspaceLayout from "@/components/layout/workspace-layout"

export const metadata: Metadata = {
  title: "Workspaces - Clark",
  description: "Manage your workspaces",
}

export default function WorkspacesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen !max-w-[calc(100vw)] ">
      <WorkspaceLayout>
        {children}
      </WorkspaceLayout>
    </div>
  )
}