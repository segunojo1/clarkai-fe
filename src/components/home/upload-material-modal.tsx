"use client";

import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Globe,
  Link as LinkIcon,
  FileText,
  Scan,
  Loader2,
  X,
  HardDrive,
  FolderOpen,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useWorkspaceStore } from "@/store/workspace.store";
import { toast } from "sonner";
import workspaceServiceInstance from "@/services/workspace.service";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadMaterial from "./upload-material";

interface UploadMaterialModalProps {
  children: React.ReactNode;
  workspaceId: string;
}

export function UploadMaterialModal({
  children,
  workspaceId,
}: UploadMaterialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Materials");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [deletingFileUrl, setDeletingFileUrl] = useState<string | null>(null);
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [isUploadingYoutubeLink, setIsUploadingYoutubeLink] = useState(false);
  const [uploadedVideoPreview, setUploadedVideoPreview] = useState<{
    title: string;
    description?: string;
    channelTitle?: string;
    thumbnailUrl?: string;
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
    videoId?: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteFile, setPendingDeleteFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const { selectedWorkspace, selectWorkspace } = useWorkspaceStore();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const materialLength =
    selectedWorkspace &&
    selectedWorkspace?.workspace?.files?.pdfFiles.length +
      selectedWorkspace?.workspace?.files?.imageFiles?.length;
  const youtubeVideos: Array<{
    videoId?: string;
    title?: string;
    thumbnailUrl?: string;
    filePath?: string;
    fileName?: string;
  }> = selectedWorkspace?.workspace?.files?.youtubeVideos ?? [];

  const requestDeleteFile = (fileUrl: string, fileName: string) => {
    setPendingDeleteFile({ url: fileUrl, name: fileName });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!pendingDeleteFile) return;

    try {
      setDeletingFileUrl(pendingDeleteFile.url);
      await workspaceServiceInstance.deleteFile(
        workspaceId,
        pendingDeleteFile.url,
      );
      const workspace =
        await workspaceServiceInstance.getWorkspaces(workspaceId);
      selectWorkspace(workspace);
      toast.success("File deleted successfully");
      setIsDeleteDialogOpen(false);
      setPendingDeleteFile(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    } finally {
      setDeletingFileUrl(null);
    }
  };

  // console.log(selectedWorkspace);

  // const { workspace } = selectedWorkspace

  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)[\w-]{11}(\S*)?$/;

  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = youtubeRegex.test(url);
  const showError = touched && url.length > 0 && !isValid;
  const showSuccess = touched && url.length > 0 && isValid;

  const extractYoutubeVideoId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const directIdMatch = trimmed.match(/^[\w-]{11}$/);
    if (directIdMatch) return directIdMatch[0];

    const urlMatch = trimmed.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    );
    return urlMatch?.[1] ?? "";
  };

  const handleUploadYoutubeLink = async () => {
    setTouched(true);
    if (!isValid) return;

    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      toast.error("Could not extract YouTube video ID");
      return;
    }

    try {
      setIsUploadingYoutubeLink(true);
      const response =
        await workspaceServiceInstance.addYoutubeVideoToWorkspace({
          video_id: videoId,
          workspace_id: workspaceId,
        });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to upload YouTube link");
      }

      const videoData = response.videoData;
      setUploadedVideoPreview(
        videoData
          ? {
              title: videoData.title,
              description: videoData.description,
              channelTitle: videoData.channelTitle,
              thumbnailUrl: videoData.thumbnailUrl,
              viewCount: videoData.viewCount,
              likeCount: videoData.likeCount,
              commentCount: videoData.commentCount,
              videoId: videoData.videoId,
            }
          : null,
      );

      const workspace =
        await workspaceServiceInstance.getWorkspaces(workspaceId);
      selectWorkspace(workspace);
      toast.success(response.message || "Video added successfully.");
      setUrl("");
      setTouched(false);
    } catch (error) {
      console.error("Failed to upload YouTube link:", error);
      toast.error("Failed to upload YouTube link");
    } finally {
      setIsUploadingYoutubeLink(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="dark:bg-[#18191A] bg-[#F8F8F7] border border-[#333] text-white w-[500px] max-h-[80vh] p-0 rounded-2xl shadow-2xl overflow-y-auto"
        align="start"
        sideOffset={8}
      >
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[440px] bg-[#2A2A2A] border-[#444] text-white">
            <DialogHeader>
              <DialogTitle>Delete file?</DialogTitle>
              <DialogDescription className="text-gray-300">
                This will remove{" "}
                <span className="font-medium text-white">
                  {pendingDeleteFile?.name}
                </span>{" "}
                from this workspace.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                  disabled={!!deletingFileUrl}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white"
                onClick={handleDeleteFile}
                disabled={!!deletingFileUrl}
              >
                {deletingFileUrl ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Nav Tabs */}
        <div className="flex items-center justify-start gap-2 px-8 pt-4 pb-2">
          <button
            onClick={() => setActiveTab("Materials")}
            className={`font-medium text-base transition-colors flex items-center gap-1 px-4 py-2 rounded-lg ${
              activeTab === "Materials"
                ? "bg-[#232323] text-white"
                : "text-gray-400 dark:hover:text-white"
            }`}
          >
            Materials
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("Canvas")}
            className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${
              activeTab === "Canvas"
                ? "bg-[#232323] text-white"
                : "text-gray-400 dark:hover:text-white"
            }`}
          >
            Canvas
          </button>
          <button
            onClick={() => setActiveTab("Quizzes")}
            className={`font-medium text-base transition-colors px-4 py-2 rounded-lg ${
              activeTab === "Quizzes"
                ? "bg-[#232323] text-white"
                : "text-gray-400 dark:hover:text-white"
            }`}
          >
            Quizzes
          </button>
        </div>

        <div
          className={`flex items-center justify-start px-8 pb-2 text-[14px] text-black dark:text-gray-400 w-full ${
            activeTab === "Quizzes" ? "pt-0" : "pt-1"
          }`}
        ></div>

        <div className="flex flex-col items-start justify-start px-4 pb-8 pt-4 w-full h-full">
          {activeTab === "Materials" && (
            <>
              <Tabs defaultValue="materials" className="w-[400px] mx-auto">
                <TabsList>
                  <TabsTrigger value="materials">
                    {materialLength} Mat. Uploaded
                  </TabsTrigger>
                  <TabsTrigger value="links">
                    <LinkIcon className="w-5 h-5" />
                    <span>{youtubeVideos.length} links</span>
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    <FileText className="w-5 h-5" />
                    <span>0 Docs</span>
                  </TabsTrigger>
                  <TabsTrigger value="scans">
                    <Scan className="w-5 h-5" />
                    <span>0 Scans</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="materials" className="mx-auto">
                  {selectedWorkspace &&
                  selectedWorkspace?.workspace?.files?.pdfFiles?.length > 0 ? (
                    <div className="flex justify-center items-center flex-wrap gap-2 mx-auto max-h-[500px] overflow-y-scroll mb-5">
                      {selectedWorkspace?.workspace.files.pdfFiles.map(
                        (file: {
                          id: string;
                          filePath: string;
                          fileName: string;
                          size: string;
                        }) => (
                          <div
                            key={file.id}
                            className="flex flex-col items-center w-fit max-w-[130px] justify-between cursor-pointer dark:hover:bg-[#232323] hover:bg-white rounded-2xl p-2"
                            onClick={() => window.open(file.filePath, "_blank")}
                          >
                            <div
                              className="rounded-2xl p-0 flex flex-col items-center justify-center relative"
                              style={{ minHeight: 96 }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDeleteFile(
                                    file.filePath,
                                    file.fileName,
                                  );
                                }}
                                disabled={deletingFileUrl === file.filePath}
                                className="absolute right-0 top-0 rounded-full p-1 text-[#a3a3a3] hover:bg-[#2f2f2f] hover:text-[#ff6a3d] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Delete ${file.fileName}`}
                              >
                                {deletingFileUrl === file.filePath ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                              {/* File icon - no background, no border */}
                              <div className="flex justify-center mb-2 mt-4">
                                <Image
                                  src="/assets/fileIcon.png"
                                  alt="File icon"
                                  width={56}
                                  height={56}
                                  className="w-14 h-14 bg-transparent"
                                  style={{ background: "none" }}
                                />
                              </div>
                              <div className="text-center max-w-[130px] w-[130px] h-[50px]">
                                <p className="dark:text-gray-300  text-[#737373] text-xs font-medium leading-tight break-words">
                                  {file.fileName}
                                  <br />
                                  {file.size}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                      {selectedWorkspace?.workspace.files.imageFiles.map(
                        (file: {
                          id: string;
                          filePath: string;
                          fileName: string;
                          size: string;
                        }) => (
                          <div
                            key={file.id}
                            className="flex flex-col items-center w-fit max-w-[130px] justify-between cursor-pointer dark:hover:bg-[#232323] hover:bg-white rounded-2xl p-2"
                            onClick={() => window.open(file.filePath, "_blank")}
                          >
                            <div
                              className="rounded-2xl p-0 flex flex-col items-center justify-center relative"
                              style={{ minHeight: 96 }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDeleteFile(
                                    file.filePath,
                                    file.fileName,
                                  );
                                }}
                                disabled={deletingFileUrl === file.filePath}
                                className="absolute right-0 top-0 rounded-full p-1 text-[#a3a3a3] hover:bg-[#2f2f2f] hover:text-[#ff6a3d] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Delete ${file.fileName}`}
                              >
                                {deletingFileUrl === file.filePath ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                              {/* File icon - no background, no border */}
                              <div className="flex justify-center mb-2 mt-4">
                                <Image
                                  src="/assets/fileIcon.png"
                                  alt="File icon"
                                  width={56}
                                  height={56}
                                  className="w-14 h-14 bg-transparent"
                                  style={{ background: "none" }}
                                />
                              </div>
                              <div className="text-center max-w-[130px] w-[130px] h-[50px]">
                                <p className="text-gray-300 text-xs font-medium leading-tight break-words">
                                  {file.fileName}
                                  <br />
                                  {file.size}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-start mb-8">
                      <div
                        className="rounded-2xl p-0 w-24 h-28 flex flex-col items-center justify-center relative"
                        style={{ minHeight: 96 }}
                      >
                        <div className="flex justify-center mb-2 mt-4">
                          <Image
                            src="/assets/fileIcon.png"
                            alt="File icon"
                            width={56}
                            height={56}
                            className="w-14 h-14 bg-transparent"
                            style={{ background: "none" }}
                          />
                        </div>

                        <div className="text-left w-full pl-4">
                          <p className="dark:text-gray-300 text-[#737373] text-xs font-medium leading-tight">
                            Your Material
                            <br />
                            goes here
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-[#232323] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-white">
                            {uploadedFile.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {uploadedFile.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUploadedFile(null);
                            setUploadProgress(0);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <UploadMaterial
                    isMounted={isMounted}
                    setIsCreatingMaterial={setIsCreatingMaterial}
                    workspaceId={workspaceId}
                    isCreatingMaterial={isCreatingMaterial}
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    setUploadProgress={setUploadProgress}
                    uploadProgress={uploadProgress}
                  />
                </TabsContent>
                <TabsContent value="links">
                  {youtubeVideos.length > 0 ? (
                    <div className="flex justify-center items-center flex-wrap gap-2 mx-auto max-h-[500px] overflow-y-scroll mb-5">
                      {youtubeVideos.map(
                        (file: {
                          videoId?: string;
                          title?: string;
                          thumbnailUrl?: string;
                          filePath?: string;
                          fileName?: string;
                        }) => (
                          <div
                            key={file.videoId || file.filePath || file.fileName}
                            className="flex flex-col items-center w-fit max-w-[130px] justify-between cursor-pointer dark:hover:bg-[#232323] hover:bg-white rounded-2xl p-2"
                            onClick={() =>
                              window.open(
                                file.filePath ||
                                  (file.videoId
                                    ? `https://www.youtube.com/watch?v=${file.videoId}`
                                    : ""),
                                "_blank",
                              )
                            }
                          >
                            <div
                              className="rounded-2xl p-0 flex flex-col items-center justify-center"
                              style={{ minHeight: 96 }}
                            >
                              <div className="flex justify-center mb-2 mt-4">
                                {file.thumbnailUrl ? (
                                  <Image
                                    src={file.thumbnailUrl}
                                    alt={
                                      file.title ||
                                      file.fileName ||
                                      "YouTube thumbnail"
                                    }
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 rounded-md object-cover"
                                  />
                                ) : (
                                  <Globe className="w-14 h-14 text-[#737373]" />
                                )}
                              </div>
                              <div className="text-center max-w-[130px] w-[130px] h-[50px]">
                                <p className="dark:text-gray-300 text-[#737373] text-xs font-medium leading-tight break-words">
                                  {file.title ||
                                    file.fileName ||
                                    "YouTube Video"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No links yet.</div>
                  )}
                  <Dialog
                    open={isYoutubeDialogOpen}
                    onOpenChange={setIsYoutubeDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-gray-600 text-white hover:bg-gray-700"
                      >
                        Upload new Youtube Video Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Youtube Video Link</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-3">
                        <Input
                          value={url}
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          onChange={(e) => setUrl(e.target.value)}
                          onBlur={() => setTouched(true)}
                        />

                        <Button
                          type="button"
                          onClick={handleUploadYoutubeLink}
                          disabled={!isValid || isUploadingYoutubeLink}
                          className={` ${showError ? "border-red-500 focus:ring-red-200" : ""} bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-[100px] py-[10px] cursor-pointer rounded-[5px] transition-colors ml-4 w-full mx-auto`}
                        >
                          {isUploadingYoutubeLink ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </span>
                          ) : (
                            "Upload Link"
                          )}
                        </Button>

                        {showError && (
                          <p className="text-red-500 text-sm">
                            Please enter a valid YouTube URL.
                          </p>
                        )}
                        {showSuccess && (
                          <p className="text-green-500 text-sm">
                            ✓ Valid YouTube URL
                          </p>
                        )}

                        {uploadedVideoPreview && (
                          <div className="mt-4 rounded-lg border border-[#3a3a3a] p-3">
                            <p className="mb-2 text-xs text-gray-400">
                              Preview from uploaded result
                            </p>
                            <div className="flex gap-3">
                              {uploadedVideoPreview.thumbnailUrl ? (
                                <Image
                                  src={uploadedVideoPreview.thumbnailUrl}
                                  alt={uploadedVideoPreview.title}
                                  width={120}
                                  height={68}
                                  className="h-[68px] w-[120px] rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex h-[68px] w-[120px] items-center justify-center rounded-md bg-[#232323]">
                                  <Globe className="h-6 w-6 text-[#737373]" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-medium text-white">
                                  {uploadedVideoPreview.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                  {uploadedVideoPreview.channelTitle}
                                </p>
                                <p className="mt-1 text-[11px] text-gray-500">
                                  {uploadedVideoPreview.viewCount} views •
                                  {uploadedVideoPreview.likeCount} likes •
                                  {uploadedVideoPreview.commentCount} comments
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
                <TabsContent value="files">
                  Change your password here.
                </TabsContent>
                <TabsContent value="scans">
                  Change your password here.
                </TabsContent>
              </Tabs>
            </>
          )}
          {activeTab === "Quizzes" && (
            <>
              {}
              {selectedWorkspace &&
              selectedWorkspace?.workspace?.quizzes?.length > 0 ? (
                <div className="w-full space-y-4">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Available Quizzes
                  </h3>
                  <div className="grid gap-4">
                    {selectedWorkspace.workspace.quizzes.map((quiz, index) => (
                      <div
                        key={quiz.id || index}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-medium">
                              {quiz.name || "Untitled Quiz"}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Created{" "}
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
                            <Link href={`/quiz/${quiz.id}/overview`}>
                              Overview
                            </Link>
                          </div>
                        </div>
                        {quiz.quizSource && (
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                            {quiz.quizSource}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-start w-full">
                      <Button
                        className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-32 py-4 rounded-md transition-colors ml-4 w-96"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("openQuizPanel", {
                              detail: { workspaceId: workspaceId },
                            }),
                          );
                          setIsOpen(false);
                        }}
                      >
                        Create a Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-start justify-start">
                  <div className="text-left mb-8 w-full">
                    <h2 className="text-3xl font-normal dark:text-white text-black flex items-center gap-3 mb-4">
                      Nothing to answer here... yet
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#A3A3A3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <path d="M9 14h6" />
                        <path d="M9 10h6" />
                        <path d="M9 18h2" />
                      </svg>
                    </h2>
                  </div>
                  {selectedWorkspace?.workspace?.files?.pdfFiles?.length !==
                  0 ? (
                    <>
                      <div className="space-y-6 dark:text-gray-300 text-black leading-relaxed mb-8 w-full max-w-xl text-left break-words">
                        <p className="text-sm">
                          Create quizzes from your uploaded materials, notes, or
                          custom questions to start testing your knowledge.
                        </p>
                        <p className="text-sm">
                          Clark helps you generate questions in
                          seconds—organized, trackable, and tailored to what
                          you&apos;re learning. You&apos;ll be able to revisit
                          them, share with friends, or build streaks by taking
                          them daily.
                        </p>
                        <div className="border-l-2 border-[#5A5A5A] pl-4">
                          <p className="break-words whitespace-normal text-sm">
                            Use the{" "}
                            <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-xs font-medium">
                              @quiz
                            </span>{" "}
                            tag or &quot;create&quot; button in chat to generate
                            one instantly.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-start w-full">
                        <Button
                          className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-32 py-4 rounded-md transition-colors ml-4 w-96"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("openQuizPanel", {
                                detail: { workspaceId: workspaceId },
                              }),
                            );
                            setIsOpen(false);
                          }}
                        >
                          Create a Quiz
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h1>
                        Ensure you upload a material before creating a quiz
                      </h1>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

const GOOGLE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY;
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GooglePickerResponse {
  action: string;
  docs: Array<{ id: string; name: string; mimeType: string }>;
}

export function FileUploadButton({ workspaceId }: { workspaceId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log(files);
    if (!files || files.length == 0) return;

    await runUpload(Array.from(files));
  };

  const runUpload = async (fileArray: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 500);

    try {
      await useWorkspaceStore.getState().uploadFile(fileArray, workspaceId);
      const workspace =
        await workspaceServiceInstance.getWorkspaces(workspaceId);
      useWorkspaceStore.getState().selectWorkspace(workspace);
      clearInterval(interval);
      setUploading(false);
      toast.success("File uploaded successfully");
    } catch (error) {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(0);
      console.error(error);
      toast.error("Failed to upload file");
    }
  };
  const openGooglePicker = async () => {
    setShowDropdown(false);

    try {
      if (!GOOGLE_CLIENT_ID) {
        toast.error(
          "Missing Google Client ID. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and restart the dev server.",
        );
        console.error(
          "Google Drive Picker config missing: NEXT_PUBLIC_GOOGLE_CLIENT_ID",
        );
        return;
      }

      if (!GOOGLE_API_KEY) {
        toast.error(
          "Missing Google API key. Set NEXT_PUBLIC_GOOGLE_API_KEY and restart the dev server.",
        );
        console.error(
          "Google Drive Picker config missing: NEXT_PUBLIC_GOOGLE_API_KEY",
        );
        return;
      }

      // Load Google APIs
      await loadScript("https://apis.google.com/js/api.js");
      await loadScript("https://accounts.google.com/gsi/client");

      // Get OAuth token via Google Identity Services
      const token = await new Promise<string>((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.readonly",
          callback: (response: { access_token?: string; error?: string }) => {
            if (response.error) reject(new Error(response.error));
            else resolve(response.access_token!);
          },
        });
        client.requestAccessToken();
      });

      // Load picker API
      await new Promise<void>((resolve) => {
        window.gapi.load("picker", resolve);
      });

      // Build and show picker
      const picker = new window.google.picker.PickerBuilder()
        .addView(
          new window.google.picker.DocsView()
            .setIncludeFolders(false)
            .setMimeTypes(
              "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,image/gif,video/mp4,video/webm",
            ),
        )
        .setOAuthToken(token)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback(async (data: GooglePickerResponse) => {
          if (data.action !== window.google.picker.Action.PICKED) return;

          const driveFiles = data.docs;
          setUploading(true);
          setUploadProgress(0);

          try {
            const fileArray: File[] = await Promise.all(
              driveFiles.map(async (doc) => {
                const res = await fetch(
                  `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                  { headers: { Authorization: `Bearer ${token}` } },
                );
                const blob = await res.blob();
                return new File([blob], doc.name, { type: doc.mimeType });
              }),
            );

            await runUpload(fileArray);
          } catch (err) {
            console.error(err);
            setUploading(false);
            setUploadProgress(0);
            toast.error("Failed to import from Google Drive");
          }
        })
        .build();

      picker.setVisible(true);
    } catch (err) {
      console.error(err);
      const errMessage = err instanceof Error ? err.message : "";
      if (errMessage.includes("client_id")) {
        toast.error(
          "Google Drive config error: invalid/missing Client ID. Check NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
        );
      } else {
        toast.error("Could not open Google Drive picker");
      }
    }
  };

  return (
    <div className="relative ml-4">
      <div className="flex">
        {/* Main button */}
        <button
          onClick={() => {
            setShowDropdown(false);
            fileInputRef.current?.click();
          }}
          disabled={uploading}
          className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 disabled:opacity-70 text-white font-medium text-lg px-10 py-[10px] cursor-pointer rounded-l-[5px] transition-colors w-80"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading... {uploadProgress}%
            </span>
          ) : (
            "Upload Materials"
          )}
        </button>

        {/* Dropdown toggle */}
        <button
          onClick={() => setShowDropdown((v) => !v)}
          disabled={uploading}
          className="bg-[#FF3D00] hover:bg-[#d63400] disabled:opacity-70 text-white px-3 py-[10px] rounded-r-[5px] border-l border-white/20 transition-colors cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-[5px] shadow-lg z-50 w-56 overflow-hidden">
          <button
            onClick={() => {
              setShowDropdown(false);
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HardDrive className="w-4 h-4 text-gray-500" />
            Upload from Computer
          </button>
          <button
            onClick={openGooglePicker}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <FolderOpen className="w-4 h-4 text-[#4285F4]" />
            Import from Google Drive
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm"
        multiple
      />
    </div>
  );
}
