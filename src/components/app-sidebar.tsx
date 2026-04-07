"use client";

import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

import {
  CircleUserRound,
  ChevronDown,
  ChevronRight,
  Edit,
  Globe,
  Home,
  Inbox,
  PlusIcon,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useUserStore } from "@/store/user.store";
import { useChatStore } from "@/store/chat.store";
import { WorkspaceCreationModal } from "./home/workspace-creation-modal";
import { useWorkspaceStore } from "@/store/workspace.store";
import { ProfileModal } from "./profile-modal";
import workspaceService from "@/services/workspace.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import chatService from "@/services/chat.service";
import { PDFViewer } from "./chat/pdf-viewer";

export const LatestChat = () => {
  const { chats, currentChatId, removeChat, setCurrentChatId, clearMessages } =
    useChatStore();
  const { state } = useSidebar();
  const router = useRouter();
  const [showAllChats, setShowAllChats] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [confirmDeleteChatId, setConfirmDeleteChatId] = useState<string | null>(
    null,
  );

  const visibleChats = showAllChats ? chats : chats.slice(0, 4);

  const selectedChatToDelete = chats.find(
    (chat) => chat.id === confirmDeleteChatId,
  );

  const handleDeleteChat = async (chatId: string) => {
    try {
      setDeletingChatId(chatId);
      const response = await chatService.deleteChat(chatId);

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to delete chat");
      }

      removeChat(chatId);

      if (currentChatId === chatId) {
        clearMessages();
        setCurrentChatId(null);
        router.push("/chat");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setDeletingChatId(null);
      setConfirmDeleteChatId(null);
    }
  };

  // Show collapsed version when sidebar is collapsed
  if (state === "collapsed") {
    return (
      <div className="flex justify-center">
        <Link href="/chat">
          <Button
            size="icon"
            className="bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252]"
          >
            <Globe width={20} height={20} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {chats.length == 0 ? (
        <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
          <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
            <Globe width={20} height={20} />
            <p className=" text-[12px]/[22px] font-medium satoshi text-center">
              Your latest chats will show up once you start talking to Clark.
            </p>
            <Link href="/chat" className="w-full cursor-pointer">
              <Button className="min-w-full  bg-[#F8F8F7] dark:bg-[#2C2C2C]  hover:bg-[#ffffff] text-[#525252] text-3 font-semibold">
                Start a Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="">
          <h2 className="text-[12px]/[22px] font-bold">Recent Chats</h2>
          <div
            className={`${showAllChats ? "max-h-[220px]" : "max-h-[120px]"} overflow-y-scroll`}
          >
            {visibleChats.map((chat) => (
              <div
                key={chat.id}
                className="group flex w-full items-center justify-between gap-2 px-[11px] py-1 dark:hover:bg-gray-800 hover:bg-gray-300"
              >
                <Link href={`/chat/${chat.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">
                    {chat.name}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteChatId(chat.id)}
                  disabled={deletingChatId === chat.id}
                  className="rounded p-1 text-[#737373] opacity-0 transition-opacity hover:bg-[#2f2f2f] hover:text-[#ff6a3d] group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Delete ${chat.name}`}
                >
                  {deletingChatId === chat.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}

            <Dialog
              open={!!confirmDeleteChatId}
              onOpenChange={(open) => {
                if (!open) setConfirmDeleteChatId(null);
              }}
            >
              <DialogContent className="sm:max-w-[440px] bg-[#2A2A2A] border-[#444] text-white">
                <DialogHeader>
                  <DialogTitle>Delete chat?</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    This will permanently remove{" "}
                    <span className="font-medium text-white">
                      {selectedChatToDelete?.name || "this chat"}
                    </span>{" "}
                    from your recent chats.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                    disabled={!!deletingChatId}
                    onClick={() => setConfirmDeleteChatId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-[#FF3D00] text-white hover:bg-[#FF3D00]/90"
                    disabled={!confirmDeleteChatId || !!deletingChatId}
                    onClick={async () => {
                      if (!confirmDeleteChatId) return;
                      await handleDeleteChat(confirmDeleteChatId);
                    }}
                  >
                    {deletingChatId === confirmDeleteChatId ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {chats.length > 4 && (
            <Button
              onClick={() => setShowAllChats((prev) => !prev)}
              className="w-full text-[14px] font-bold dark:text-white hover:bg-[#F0F0EF] text-black dark:bg-[#404040] bg-[#F0F0EF] mt-1"
            >
              {showAllChats ? "Show less" : "View all chats"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const LatestWorkspace = () => {
  const { workspaces, isLoading } = useWorkspaceStore();
  const { state } = useSidebar();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
        <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </CardContent>
      </Card>
    );
  }

  // Show collapsed version when sidebar is collapsed
  if (state === "collapsed") {
    return (
      <div className="flex justify-center">
        <WorkspaceCreationModal>
          <Button
            size="icon"
            className="bg-[#F8F8F7] dark:bg-[#2C2C2C] text-[#525252]"
          >
            <Globe width={20} height={20} />
          </Button>
        </WorkspaceCreationModal>
      </div>
    );
  }

  return (
    <div>
      {workspaces.length == 0 ? (
        <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[132px] w-[214px] shadow-none mx-auto">
          <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
            <Globe width={20} height={20} />
            <p className=" text-[12px]/[22px] font-medium satoshi text-center">
              Your workspaces will appear here once you create one.
            </p>
            <WorkspaceCreationModal>
              <Button className="min-w-full  bg-[#F8F8F7] dark:bg-[#2C2C2C] hover:bg-[#ffffff] text-[#525252] text-3 font-semibold">
                Start a workspace
              </Button>
            </WorkspaceCreationModal>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-[#525252] dark:text-[#D4D4D4] bg-[#F0F0EF] dark:bg-[#404040] rounded-[10px] !p-[10px] h-[184px] w-[214px] shadow-none mx-auto">
          <CardContent className=" flex flex-col items-center justify-between px-0 h-full">
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-medium">Workspaces</h2>
                <div className="flex gap-[10px] ">
                  <WorkspaceCreationModal>
                    <PlusIcon className="w-4 h-4" />
                  </WorkspaceCreationModal>
                  <Link href="/workspaces">
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </Link>
                </div>
              </div>
              <div className="flex flex-col overflow-y-scroll gap-1 h-[132px]">
                {workspaces.map((workspace) => (
                  <Link
                    href={`/workspaces/${workspace.enc_id}`}
                    key={workspace.enc_id}
                    className={`${pathname === workspace.enc_id ? "bg-[#ffffff]" : ""} flex items-center justify-between dark:bg-[#262626] gap-1 px-[10px] py-[5px] rounded-[5px]`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe width={20} height={20} />
                      <p className="text-sm font-medium">{workspace.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SidebarItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface SidebarGroupCustomProps {
  items: SidebarItem[];
  label?: string;
}

const SidebarGroupCustom = ({ items, label }: SidebarGroupCustomProps) => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="text-[11px]/[22px] font-medium">
          {items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              className={`transition-all duration-200 rounded-[5px] ${
                item.url && pathname === item.url
                  ? "bg-[#F0F0EF] dark:bg-[#404040]"
                  : "bg-[#F8F8F7] dark:bg-[#2C2C2C]"
              }`}
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={!!item.url && pathname === item.url}
              >
                {item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="pl-5 transition-colors duration-200 rounded-[5px] hover:bg-[#F0F0EF] dark:hover:bg-[#404040]"
                  >
                    <item.icon className="transition-colors duration-200 text-[#525252] dark:text-[#D4D4D4]" />
                    <span className="transition-colors duration-200 text-[#525252] dark:text-[#D4D4D4]">
                      {item.title}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.url || "#"}
                    className={`pl-5 transition-colors duration-200 rounded-[5px] ${
                      item.url && pathname === item.url
                        ? "bg-[#F0F0EF] dark:bg-[#404040]"
                        : "hover:bg-[#F0F0EF] dark:hover:bg-[#404040]"
                    }`}
                  >
                    <item.icon
                      className={`transition-colors duration-200 ${
                        item.url && pathname === item.url
                          ? "text-orange-500 dark:text-orange-400"
                          : "text-[#525252] dark:text-[#D4D4D4]"
                      }`}
                    />
                    <span
                      className={`transition-colors duration-200 ${
                        item.url && pathname === item.url
                          ? "text-orange-500 dark:text-orange-400"
                          : "text-[#525252] dark:text-[#D4D4D4]"
                      }`}
                    >
                      {item.title}
                    </span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const pathname = usePathname();
  const isWorkspaceDetailPage = pathname?.startsWith("/workspaces/");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPdfCanvasOpen, setIsPdfCanvasOpen] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string>("PDF");
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  const workspaceResults = Array.isArray(results?.WorkspaceResult)
    ? results.WorkspaceResult
    : [];
  const chatResults = Array.isArray(results?.chatResult)
    ? results.chatResult
    : [];
  const pdfResults = Array.isArray(results?.pdfResult) ? results.pdfResult : [];
  const imageResults = Array.isArray(results?.imageFilesResult)
    ? results.imageFilesResult
    : [];

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearchError(null);
    setSearchLoading(true);
    try {
      const resp = await workspaceService.search({ s: query });
      setResults(resp);
    } catch (error) {
      console.error(error);
      setSearchError("Search failed. Try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const openPdfInCanvas = (pdfResult: any) => {
    const filePath =
      pdfResult?.filePath || pdfResult?.url || pdfResult?.file_url || "";
    if (!filePath) {
      toast.error("Unable to open this PDF in canvas");
      return;
    }

    setSelectedPdfFile(filePath);
    setSelectedPdfName(pdfResult?.fileName || pdfResult?.name || "PDF");
    setIsSearchOpen(false);
    setIsPdfCanvasOpen(true);
  };

  const items = [
    { title: "Search", icon: Search, onClick: () => setIsSearchOpen(true) },
    { title: "Home", url: "/home", icon: Home },
    { title: "Chat", url: "/chat", icon: Inbox },
    { title: "Workspaces", url: "/workspaces", icon: Globe },
  ];
  const workspaceItems = [
    { title: "Canvas", url: "/home", icon: Search },
    { title: "Whiteboard", url: "/home", icon: Home },
    { title: "Materials", url: "/home", icon: Inbox },
    { title: "Study Groups", url: "/home", icon: Inbox },
  ];

  const { user } = useUserStore();
  const planName = user?.plan
    ? `${user.plan.charAt(0).toUpperCase()}${user.plan.slice(1)}`
    : "";

  return (
    <>
      <Sidebar
        className="dark:bg-[#2c2c2c] bg-[#F8F8F7] transition-none"
        collapsible="icon"
        variant="sidebar"
      >
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupContent className="flex items-center justify-between">
              <div className="flex items-center gap-[10px] group-data-[collapsible=icon]:justify-center">
                <Image
                  src={
                        user?.image_url && user.image_url !== ""
                          ? user.image_url : "/assets/orange.png"
                      }
                  alt="user avatar"
                  width={24}
                  height={24}
                  className="rounded-full w-[24px] h-[24px]"
                />

                <p className="text-[14px] font-bold group-data-[collapsible=icon]:hidden">
                  {user?.name || "User"}
                </p>
              </div>
              <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
                <SidebarTrigger />
                <Link
                  href="/chat"
                  className="group-data-[collapsible=icon]:hidden"
                >
                  <Edit width={20} height={20} />
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-y-auto">
          <SidebarGroupCustom items={items} />
          <SidebarGroup className="mx-auto">
            <LatestChat />
          </SidebarGroup>
          <SidebarGroup className="mx-auto">
            <LatestWorkspace />
          </SidebarGroup>
          {/* <SidebarGroupCustom items={workspaceItems} label="Workspace Hub" /> */}
        </SidebarContent>

        <SidebarFooter className="flex items-center justify-between">
          <div className="flex items-center gap-[10px] group-data-[collapsible=icon]:hidden">
            <Image
              src={
                user?.image_url && user.image_url !== ""
                  ? user.image_url
                  : "/assets/orange.png"
              }
              alt="user avatar"
              width={24}
              height={24}
              className="rounded-full w-[24px] h-[24px]"
            />

            <p className="text-[14px] font-bold group-data-[collapsible=icon]:hidden">
              {`${user?.name && user.name.length > 7 ? user.name.slice(0, 7) + "..." : user?.name || "User"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#292929] text-white rounded-[4px] px-2 py-1 text-[12px] font-semibold group-data-[collapsible=icon]:hidden">
              {planName}
            </div>
            <ProfileModal>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-[#525252] dark:text-[#D4D4D4] hover:bg-[#F0F0EF] dark:hover:bg-[#404040]"
              >
                <CircleUserRound className="h-5 w-5" />
              </Button>
            </ProfileModal>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="!max-w-[950px] w-full">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search workspaces, files, chats, and more.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workspaces, files, chats..."
              className="flex-1 px-3 py-2 rounded border bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF3D00] text-white rounded"
              disabled={searchLoading}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchError && <div className="text-red-500">{searchError}</div>}

          {!results && (
            <div className="text-sm text-gray-500">
              Enter a query to search.
            </div>
          )}

          {results && (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="workspaces">
                  Workspaces ({workspaceResults.length})
                </TabsTrigger>
                <TabsTrigger value="chats">
                  Chats ({chatResults.length})
                </TabsTrigger>
                <TabsTrigger value="pdfs">
                  PDFs ({pdfResults.length})
                </TabsTrigger>
                <TabsTrigger value="images">
                  Images ({imageResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="h-[420px] overflow-y-auto pr-1 space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-2">Workspaces</h2>
                    {workspaceResults.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No workspace results.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {workspaceResults.map((w: any) => (
                          <li key={w.enc_id} className="p-3 border rounded">
                            <Link
                              href={`/workspaces/${w.enc_id}`}
                              className="text-blue-600"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              {w.name}
                            </Link>
                            {w.description && (
                              <div className="text-sm text-gray-600">
                                {w.description}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-2">Chats</h2>
                    {chatResults.length === 0 ? (
                      <p className="text-sm text-gray-500">No chat results.</p>
                    ) : (
                      <ul className="space-y-2">
                        {chatResults.map((c: any) => (
                          <li key={c.id} className="p-3 border rounded">
                            <Link
                              href={`/chat/${c.id}`}
                              className="text-blue-600"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-2">PDFs</h2>
                    {pdfResults.length === 0 ? (
                      <p className="text-sm text-gray-500">No PDF results.</p>
                    ) : (
                      <ul className="space-y-2">
                        {pdfResults.map((p: any, i: number) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-3 p-3 border rounded"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {p.fileName || p.name || "PDF"}
                              </div>
                              {p.workspaceName && (
                                <div className="text-xs text-gray-500 truncate">
                                  {p.workspaceName}
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => openPdfInCanvas(p)}
                            >
                              Open in Canvas
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-2">Images</h2>
                    {imageResults.length === 0 ? (
                      <p className="text-sm text-gray-500">No image results.</p>
                    ) : (
                      <ul className="space-y-2">
                        {imageResults.map((img: any, i: number) => (
                          <li key={i} className="p-3 border rounded">
                            <div className="text-sm">
                              {img.fileName || img.name || "Image"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workspaces">
                <div className="h-[420px] overflow-y-auto pr-1">
                  {workspaceResults.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No workspace results.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {workspaceResults.map((w: any) => (
                        <li key={w.enc_id} className="p-3 border rounded">
                          <Link
                            href={`/workspaces/${w.enc_id}`}
                            className="text-blue-600"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            {w.name}
                          </Link>
                          {w.description && (
                            <div className="text-sm text-gray-600">
                              {w.description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chats">
                <div className="h-[420px] overflow-y-auto pr-1">
                  {chatResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No chat results.</p>
                  ) : (
                    <ul className="space-y-2">
                      {chatResults.map((c: any) => (
                        <li key={c.id} className="p-3 border rounded">
                          <Link
                            href={`/chat/${c.id}`}
                            className="text-blue-600"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pdfs">
                <div className="h-[420px] overflow-y-auto pr-1">
                  {pdfResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No PDF results.</p>
                  ) : (
                    <ul className="space-y-2">
                      {pdfResults.map((p: any, i: number) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-3 p-3 border rounded"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {p.fileName || p.name || "PDF"}
                            </div>
                            {p.workspaceName && (
                              <div className="text-xs text-gray-500 truncate">
                                {p.workspaceName}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => openPdfInCanvas(p)}
                          >
                            Open in Canvas
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="images">
                <div className="h-[420px] overflow-y-auto pr-1">
                  {imageResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No image results.</p>
                  ) : (
                    <ul className="space-y-2">
                      {imageResults.map((img: any, i: number) => (
                        <li key={i} className="p-3 border rounded">
                          <div className="text-sm">
                            {img.fileName || img.name || "Image"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {isPdfCanvasOpen && selectedPdfFile && (
        <PDFViewer
          file={selectedPdfFile}
          onClose={() => {
            setIsPdfCanvasOpen(false);
            setSelectedPdfFile(null);
            setSelectedPdfName("PDF");
          }}
        />
      )}
    </>
  );
}
