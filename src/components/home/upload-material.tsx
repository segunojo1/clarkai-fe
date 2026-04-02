"use client";

import { Globe, Loader2, Sparkles, X, FileText, Download } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { FileUploadButton } from "./upload-material-modal";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import workspaceServiceInstance from "@/services/workspace.service";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MaterialPdf from "./MaterialPdf";

export default function UploadMaterial({isMounted, setIsCreatingMaterial, workspaceId, isCreatingMaterial, uploadedFile, setUploadedFile, setUploadProgress, uploadProgress}: any) {

      const { selectedWorkspace } = useWorkspaceStore();
        const [topic, setTopic] = useState("");
          const [wordRange, setWordRange] = useState<string>("500-1000");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [creationMode, setCreationMode] = useState<"topic" | "pdf">("topic");
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);
    const [generatedMaterial, setGeneratedMaterial] = useState<{
      text: string;
    } | null>(null);
    

      const formatTimeLeft = (progress: number): string => {
        if (progress === 0) return "Starting...";
        if (progress === 100) return "Complete";
        const timeLeft = Math.floor((100 - progress) / 10); // Assuming 10% progress per second
        return `${timeLeft}s left`;
      };

      const wordRanges = [
    { value: "300-500", label: "Short (300-500 words)" },
    { value: "500-1000", label: "Normal (500-1000 words)" },
    { value: "1000-1500", label: "Medium (1000-1500 words)" },
    { value: "1500-2000", label: "Long (1500-2000 words)" },
    { value: "2000-3000", label: "Detailed (2000-3000 words)" },
    { value: "3000-5000", label: "Very Detailed (3000-5000 words)" },
  ];

    return (
              <div className="w-full flex flex-col items-start">
                {selectedWorkspace?.workspace?.files?.pdfFiles?.length == 0 && (
                  <>
                    <div className="text-left mb-8 w-full">
                      <h2 className="text-3xl font-normal dark:text-white text-black flex items-center gap-3 mb-4">
                        Upload your First Material
                        <Globe className="w-7 h-7 text-gray-400" />
                      </h2>
                    </div>
                    <div className="space-y-6 text-base dark:text-gray-300 text-black leading-relaxed mb-8 w-full max-w-xl text-left break-words">
                      <p>
                        Upload PDFs, videos, or notes to start building your
                        learning flow.
                      </p>
                      <p>
                        We help you organize every material you add—so
                        everything stays structured, easy to access, and focused
                        on what matters.
                      </p>
                      <div className="border-l-2 border-[#5A5A5A] pl-4">
                        <p className="break-words whitespace-normal text-sm">
                          You&apos;ll also be able to reference them in chats
                          using the
                          <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-xs font-medium">
                            @materials
                          </span>
                          and
                          <span className="bg-[#FF3D00] text-white px-2 py-1 rounded text-xs font-medium">
                            @update
                          </span>
                          tags to ask questions about them,
                          <br />
                          and turn them into flashcards, quizzes, and more.
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {uploadedFile ? (
                  <Card className="w-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1">
                            {uploadedFile.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {uploadedFile.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUploadedFile(null);
                            setUploadProgress(0);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <Progress value={uploadProgress} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>{uploadProgress}%</span>
                          <span>{formatTimeLeft(uploadProgress)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2 items-center justify-center  w-full">
                    <FileUploadButton workspaceId={workspaceId} />
                    <p className="text-[17px] font-bold dark:text-white text-black">
                      OR
                    </p>
                    <Dialog
                      open={isCreatingMaterial}
                      onOpenChange={setIsCreatingMaterial}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium text-lg px-[100px] py-[10px] cursor-pointer rounded-[5px] transition-colors ml-4 w-96">
                          Create Material
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] bg-[#2A2A2A] border-[#444] text-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">
                            Create New Material
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Choose how you&apos;d like to create your study
                            material.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          {/* Mode Selection */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                              type="button"
                              onClick={() => setCreationMode("topic")}
                              className={`p-4 rounded-lg border-2 transition-all ${creationMode === "topic" ? "border-[#FF3D00] bg-[#FF3D00]/10" : "border-[#444] hover:border-[#666]"}`}
                            >
                              <div className="flex flex-col items-center text-center">
                                <FileText className="h-6 w-6 mb-2" />
                                <span className="font-medium">From Topic</span>
                                <p className="text-xs text-gray-400 mt-1">
                                  Generate from a topic and description
                                </p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCreationMode("pdf")}
                              className={`p-4 rounded-lg border-2 transition-all ${creationMode === "pdf" ? "border-[#FF3D00] bg-[#FF3D00]/10" : "border-[#444] hover:border-[#666]"}`}
                            >
                              <div className="flex flex-col items-center text-center">
                                <FileText className="h-6 w-6 mb-2" />
                                <span className="font-medium">From PDF</span>
                                <p className="text-xs text-gray-400 mt-1">
                                  Generate from an existing PDF
                                </p>
                              </div>
                            </button>
                          </div>

                          {creationMode === "topic" ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="topic" className="text-white">
                                  Topic *
                                </Label>
                                <Input
                                  id="topic"
                                  placeholder="Enter a topic (e.g., 'Introduction to Quantum Mechanics')"
                                  value={topic}
                                  onChange={(e) => setTopic(e.target.value)}
                                  className="bg-[#333] border-[#444] text-white placeholder-gray-400"
                                />
                              </div>

                              <div className="">
                                <div className="space-y-2 min-w-full">
                                  <Label
                                    htmlFor="word-range"
                                    className="text-white"
                                  >
                                    Length
                                  </Label>
                                  <select
                                    id="word-range"
                                    value={wordRange}
                                    onChange={(e) =>
                                      setWordRange(e.target.value)
                                    }
                                    className="w-full p-2 bg-[#333] border border-[#444] rounded-md text-white"
                                  >
                                    {wordRanges.map((range) => (
                                      <option
                                        key={range.value}
                                        value={range.value}
                                      >
                                        {range.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="description"
                                  className="text-white"
                                >
                                  Additional Context (Optional)
                                </Label>
                                <Textarea
                                  id="description"
                                  placeholder="Provide more details about what you want to learn..."
                                  rows={3}
                                  value={description}
                                  onChange={(e) =>
                                    setDescription(e.target.value)
                                  }
                                  className="bg-[#333] border-[#444] text-white placeholder-gray-400"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-white">
                                  Select PDFs from Workspace
                                </Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-[#2a2a2a] rounded-md">
                                  {isMounted &&
                                    selectedWorkspace?.workspace?.files?.pdfFiles
                                      ?.filter((m) =>
                                        m.fileName.endsWith(".pdf"),
                                      )
                                      .map((material) => (
                                        <div
                                          key={material.id}
                                          className="flex items-center space-x-2"
                                        >
                                          <input
                                            type="checkbox"
                                            id={`pdf-${material.id}`}
                                            checked={selectedPdfs.includes(
                                              material.id,
                                            )}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedPdfs([
                                                  ...selectedPdfs,
                                                  material.id,
                                                ]);
                                              } else {
                                                setSelectedPdfs(
                                                  selectedPdfs.filter(
                                                    (id) => id !== material.id,
                                                  ),
                                                );
                                              }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          />
                                          <label
                                            htmlFor={`pdf-${material.id}`}
                                            className="text-sm text-gray-300 cursor-pointer"
                                          >
                                            {material.fileName}
                                          </label>
                                        </div>
                                      ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {selectedWorkspace?.workspace?.files?.pdfFiles?.filter(
                                    (m) => m.fileName.endsWith(".pdf"),
                                  ).length === 0
                                    ? "No PDFs found in your workspace. Please upload a PDF first."
                                    : selectedPdfs.length > 0
                                      ? `${selectedPdfs.length} PDF${selectedPdfs.length > 1 ? "s" : ""} selected`
                                      : "Select one or more PDFs to generate material from."}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="pdf-description"
                                  className="text-white"
                                >
                                  Additional Instructions (Optional)
                                </Label>
                                <Textarea
                                  id="pdf-description"
                                  placeholder="Any specific focus or requirements for the generated material..."
                                  rows={2}
                                  value={description}
                                  onChange={(e) =>
                                    setDescription(e.target.value)
                                  }
                                  className="bg-[#333] border-[#444] text-white placeholder-gray-400"
                                />
                              </div>
                            </div>
                          )}

                          {isGenerating && (
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center gap-2 text-blue-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Generating your material...</span>
                              </div>
                              <Progress
                                value={generationProgress}
                                className="h-2"
                              />
                              <p className="text-xs text-gray-400 text-right">
                                This may take a moment. Please don&apos;t close
                                this window.
                              </p>
                            </div>
                          )}
                        </div>

                        <DialogFooter className="sm:justify-between">
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-gray-700"
                              disabled={isGenerating}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            type="submit"
                            className="bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white"
                            disabled={
                              isGenerating ||
                              (creationMode === "topic"
                                ? !topic.trim()
                                : selectedPdfs.length === 0)
                            }
                            onClick={async () => {
                              if (
                                (creationMode === "topic" && !topic.trim()) ||
                                (creationMode === "pdf" &&
                                  selectedPdfs.length === 0)
                              ) {
                                return;
                              }

                              try {
                                setIsGenerating(true);
                                // Simulate generation progress
                                const interval = setInterval(() => {
                                  setGenerationProgress((prev) => {
                                    if (prev >= 90) {
                                      clearInterval(interval);
                                      return prev;
                                    }
                                    return prev + 10;
                                  });
                                }, 500);

                                // TODO: Replace with actual API call to generate material
                                // The API endpoint will be different based on the creation mode
                                // const payload = creationMode === 'topic'
                                //     ? {
                                //         topic,
                                //         description,
                                //         type: 'topic',
                                //         words_range: wordRange,
                                //         is_tag: true
                                //       }
                                //     : {
                                //         pdfId: selectedPdf,
                                //         instructions: description,
                                //         type: 'pdf',
                                //         words_range: wordRange
                                //       };

                                const workspace =
                                  await workspaceServiceInstance.generateMaterial(
                                    creationMode === "topic" ? topic : "",
                                    wordRange,
                                    true,
                                    description,
                                    creationMode === "pdf"
                                      ? selectedPdfs
                                      : undefined,
                                  );

                                console.log(
                                  "Generating material with:",
                                  workspace,
                                );

                                clearInterval(interval);
                                setGenerationProgress(100);

                                // Simulate completion
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 500),
                                );

                                if (
                                  workspace?.pdfGenerated &&
                                  workspace?.text
                                ) {
                                  setGeneratedMaterial({
                                    text: workspace.text,
                                  });
                                  // Auto-download the markdown
                                  // PDF download will be handled by the PDFDownloadLink component
                                  toast.success(
                                    "Material generated and downloaded successfully!",
                                  );
                                } else {
                                  toast.error(
                                    "Failed to generate material. Please try again.",
                                  );
                                }

                                // setShowCreateDialog(false);
                                setTopic("");
                                setDescription("");
                                setSelectedPdfs([]);
                                setGenerationProgress(0);
                                setIsGenerating(false);
                                setCreationMode("topic");
                              } catch (error) {
                                console.error(
                                  "Error generating material:",
                                  error,
                                );
                                toast.error(
                                  "Failed to generate material. Please try again.",
                                );
                              } finally {
                                setIsGenerating(false);
                              }
                            }}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating
                              ? "Generating..."
                              : "Generate Material"}
                          </Button>
                        </DialogFooter>
                        {generatedMaterial && (
                          <div className="p-4 mt-4 bg-gray-800 rounded-md">
                            <div className="flex flex-col space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-white">
                                  Material Ready!
                                </span>
                                {generatedMaterial?.text && (
                                  <PDFDownloadLink
                                    document={
                                      <MaterialPdf
                                        content={generatedMaterial.text}
                                        title={`Material - ${new Date().toISOString().slice(0, 10)}`}
                                      />
                                    }
                                    fileName={`material-${new Date().toISOString().slice(0, 10)}.pdf`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                  >
                                    {({ loading }) => (
                                      <>
                                        <Download className="mr-2 h-4 w-4" />
                                        {loading
                                          ? "Generating PDF..."
                                          : "Download PDF"}
                                      </>
                                    )}
                                  </PDFDownloadLink>
                                )}
                              </div>
                              {generatedMaterial?.text && (
                                <div className="text-xs text-gray-400">
                                  If the download doesn&apos;t start
                                  automatically, click the button above.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
    )
}