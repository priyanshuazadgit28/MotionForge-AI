"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Share2, Download, Heart, Eye, MessageSquare, Palette, Send, Sparkles, Loader2, CheckCircle2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getProjectStatus } from "@/app/actions/get-project"
import { RemotionDynamicPlayer } from "./remotion-dynamic-player"
import { useChat } from "ai/react"

interface ProjectStudioProps {
  project: {
    id: string
    title: string
    prompt: string
    duration: string
    ratio: string
    thumbnailGradient: string
    status: string
    views: number
    likes: number
    createdAt: Date
    themeConfig?: any
    exportStatus?: string | null
    exportProgress?: number | null
    videoUrl?: string | null
    remotionCode?: string | null
    chatMessages?: { id: string, role: string, content: string }[]
    author?: {
      name: string
      initial: string
      avatarGradient: string
    } | null
  }
}

const GENERATION_STEPS = [
  { id: "init", label: "Initializing AI Engine" },
  { id: "prompt", label: "Generating script & prompt" },
  { id: "theme", label: "Designing theme & colors" },
  { id: "code", label: "Writing Remotion components" },
]

export function ProjectStudio({ project }: ProjectStudioProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "theme">("chat")
  
  // Real Generation State
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(project.status !== "completed" && project.status !== "failed")
  const [isExporting, setIsExporting] = useState(project.exportStatus === "exporting")
  
  const [liveRemotionCode, setLiveRemotionCode] = useState(project.remotionCode)
  const [liveThemeConfig, setLiveThemeConfig] = useState(project.themeConfig)
  const [videoUrl, setVideoUrl] = useState(project.videoUrl)
  
  // We extract setMessages from useChat
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: "/api/chat",
    body: { projectId: project.id },
    initialMessages: project.chatMessages?.length ? project.chatMessages.map(m => ({ 
      id: m.id || Math.random().toString(), 
      role: (m.role === "ai" ? "assistant" : "user") as any, 
      content: m.content 
    })) : [
      { id: "initial", role: "assistant", content: `I generated a motion graphic for: "${project.prompt}". What would you like to tweak?` }
    ]
  })
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getProjectStatus(project.id)
        if (!data) return
        
        // If the database says it's not completed/failed, ensure we show generating UI
        if (data.status !== "completed" && data.status !== "failed") {
          setIsGenerating(true)
        }
        
        switch (data.status) {
          case "pending": setCurrentStepIndex(0); break;
          case "generating_prompt": setCurrentStepIndex(1); break;
          case "generating_theme": setCurrentStepIndex(2); break;
          case "generating_code": setCurrentStepIndex(3); break;
          case "completed": 
            if (isGenerating) {
              setCurrentStepIndex(4)
              setIsGenerating(false)
              if (data.remotionCode) setLiveRemotionCode(data.remotionCode)
              if (data.themeConfig) setLiveThemeConfig(data.themeConfig)
              
              // Append a success message to the chat
              setMessages(prev => [
                ...prev, 
                { id: Math.random().toString(), role: "assistant", content: "Your modified video is ready! It should be playing on your screen now. Let me know if you need any other changes." }
              ])
            }
            break;
        }

        // Handle export status polling
        if (data.exportStatus === "exporting") {
          setIsExporting(true)
        } else if (data.exportStatus === "completed" && isExporting) {
          setIsExporting(false)
          if (data.videoUrl) setVideoUrl(data.videoUrl)
          setMessages(prev => [
            ...prev, 
            { id: Math.random().toString(), role: "assistant", content: "Your video has been exported successfully! You can download it using the link provided." }
          ])
        } else if (data.exportStatus === "failed" && isExporting) {
          setIsExporting(false)
          setMessages(prev => [
            ...prev, 
            { id: Math.random().toString(), role: "assistant", content: "Sorry, there was an error exporting your video. Please try again." }
          ])
        }
      } catch (err) {
        console.error("Failed to poll status", err)
      }
    }, (isGenerating || isExporting) ? 2000 : 5000)

    return () => clearInterval(interval)
  }, [project.id, isGenerating, isExporting, setMessages])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
      handleSubmit(fakeEvent)
    }
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(project.createdAt))

  // Parse duration (e.g. "10 sec" -> 10)
  const durationMatch = project.duration.match(/\d+/)
  const durationInSeconds = durationMatch ? parseInt(durationMatch[0]) : 10

  // Parse aspect ratio
  const isPortrait = project.ratio === "9:16"
  const compWidth = isPortrait ? 1080 : 1920
  const compHeight = isPortrait ? 1920 : 1080

  const updateNestedTheme = (path: string[], newValue: any) => {
    setLiveThemeConfig((prev: any) => {
      if (!prev) return prev;
      const newTheme = JSON.parse(JSON.stringify(prev));
      let current = newTheme;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = newValue;
      return newTheme;
    });
  };

  const renderThemeEditor = (obj: any, path: string[] = []): React.ReactNode => {
    if (!obj || typeof obj !== "object") return null;
    
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      const fieldId = currentPath.join("-");
      
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return (
          <div key={fieldId} className="space-y-3 mt-4 border-l-2 border-white/10 pl-4 ml-1">
            <h4 className="text-sm font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
            <div className="space-y-4">
              {renderThemeEditor(value, currentPath)}
            </div>
          </div>
        );
      }
      
      const isColor = typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl") || key.toLowerCase().includes("color"));
      const isFont = key.toLowerCase().includes("font");
      
      return (
        <div key={fieldId} className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {isColor ? (
            <div className="flex items-center gap-3">
              <div className="relative size-8 rounded-md overflow-hidden border border-white/20 shrink-0">
                <input
                  type="color"
                  value={typeof value === 'string' && value.startsWith('#') ? value.slice(0, 7) : '#ffffff'}
                  onChange={(e) => updateNestedTheme(currentPath, e.target.value)}
                  className="absolute -inset-2 size-12 cursor-pointer appearance-none bg-transparent"
                />
              </div>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => updateNestedTheme(currentPath, e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          ) : isFont ? (
            <div className="relative">
              <select
                value={String(value)}
                onChange={(e) => updateNestedTheme(currentPath, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none"
              >
                <option value={String(value)} className="bg-surface-base">{String(value)}</option>
                <option value="Inter" className="bg-surface-base">Inter</option>
                <option value="Roboto" className="bg-surface-base">Roboto</option>
                <option value="Outfit" className="bg-surface-base">Outfit</option>
                <option value="Playfair Display" className="bg-surface-base">Playfair Display</option>
                <option value="Montserrat" className="bg-surface-base">Montserrat</option>
                <option value="Space Grotesk" className="bg-surface-base">Space Grotesk</option>
                <option value="DM Sans" className="bg-surface-base">DM Sans</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          ) : (
            <input
              type="text"
              value={String(value)}
              onChange={(e) => updateNestedTheme(currentPath, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          )}
        </div>
      );
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      })
      if (!res.ok) throw new Error("Export failed")
    } catch (err) {
      console.error(err)
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-80 lg:w-96 border-r border-white/5 bg-background flex flex-col shrink-0">
        {/* Tabs */}
        <div className="flex items-center p-2 border-b border-white/5 gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === "chat" 
                ? "bg-white/10 text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <MessageSquare className="size-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === "theme" 
                ? "bg-white/10 text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Palette className="size-4" />
            Theme
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "chat" ? (
            <div className="absolute inset-0 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-white/5 border border-white/5 text-foreground rounded-tl-sm"
                    )}>
                      {msg.role === "assistant" && <Sparkles className="size-3 text-brand-secondary mb-1.5" />}
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-white/5 bg-background/80 backdrop-blur-md">
                <form 
                  onSubmit={handleSubmit}
                  className="relative flex items-end bg-white/5 border border-white/10 rounded-[1.25rem] p-1.5 focus-within:ring-1 focus-within:ring-white/20 transition-all"
                >
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKey}
                    placeholder="Chat with AI to refine..."
                    className="w-full max-h-32 min-h-[40px] resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="shrink-0 size-8 rounded-full flex items-center justify-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors mb-0.5 mr-0.5"
                  >
                    <Send className="size-4 -ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="size-5 text-brand-secondary" />
                <h3 className="text-foreground font-semibold">Theme Settings</h3>
              </div>
              
              {!liveThemeConfig || Object.keys(liveThemeConfig).length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground">Theme configuration will appear here once generated.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {renderThemeEditor(liveThemeConfig)}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 overflow-y-auto bg-surface-base p-6 lg:p-10 relative flex flex-col">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          
          {/* Header Metadata */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-3">
              {project.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              {project.author && (
                <div className="flex items-center gap-2">
                  <div 
                    className="size-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                    style={{ background: project.author.avatarGradient }}
                  >
                    {project.author.initial}
                  </div>
                  <span className="font-medium text-foreground">{project.author.name}</span>
                </div>
              )}
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{project.ratio}</span>
              <span>•</span>
              <span>{project.duration}</span>
            </div>
          </div>

          {/* Video Player Stage */}
          <div 
            className="relative w-full overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center group bg-black/40 border border-white/10"
            style={{
              aspectRatio: project.ratio === "16:9" ? "16/9" : "9/16",
              maxHeight: project.ratio === "9:16" ? "70vh" : "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Exporting Overlay */}
            {isExporting && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center gap-6 max-w-sm w-full p-8 bg-card border rounded-2xl shadow-2xl">
                  <div className="relative flex items-center justify-center size-20 rounded-full bg-primary/10">
                    <Download className="size-10 text-primary animate-pulse" />
                    <Loader2 className="absolute inset-0 size-full text-primary/30 animate-spin" strokeWidth={1} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Rendering Video</h3>
                    <p className="text-sm text-muted-foreground">
                      Your video is being rendered in the cloud. This might take a minute...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isGenerating ? (
              // Generating State
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" style={{ background: project.thumbnailGradient }}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                  <Loader2 className="size-10 text-white animate-spin mb-6" />
                  
                  <div className="w-full space-y-4">
                    {GENERATION_STEPS.map((step, idx) => {
                      const isComplete = idx < currentStepIndex
                      const isCurrent = idx === currentStepIndex

                      return (
                        <div key={step.id} className={cn("flex items-center gap-3 text-sm font-medium transition-all duration-300", 
                          isComplete ? "text-white/60" : isCurrent ? "text-white scale-105" : "text-white/20"
                        )}>
                          {isComplete ? (
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="size-4 animate-spin shrink-0 text-brand-secondary" />
                          ) : (
                            <div className="size-4 rounded-full border-2 border-white/20 shrink-0" />
                          )}
                          <span className="flex-1 text-left">{step.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : liveRemotionCode ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                <RemotionDynamicPlayer
                  code={liveRemotionCode}
                  themeConfig={liveThemeConfig || {}}
                  durationInSeconds={durationInSeconds}
                  width={compWidth}
                  height={compHeight}
                  fps={30}
                />
              </div>
            ) : (
              // Completed State without code (Fallback)
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: project.thumbnailGradient }}>
                <button className="relative z-10 size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-transform hover:scale-110 hover:bg-white/20">
                  <Play className="size-8 ml-1" fill="currentColor" />
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors">
                <Eye className="size-4" />
                {project.views}
              </div>
              <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors">
                <Heart className="size-4" />
                {project.likes}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="mr-2 size-4" />
                Share
              </Button>
              {videoUrl ? (
                <Button 
                  size="sm" 
                  style={{ background: "oklch(0.65 0.22 285)" }}
                  onClick={async () => {
                    try {
                      // Fetch the video to bypass cross-origin download restrictions
                      const response = await fetch(videoUrl);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.style.display = "none";
                      a.href = blobUrl;
                      a.download = "export.mp4";
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(blobUrl);
                      document.body.removeChild(a);
                    } catch (err) {
                      console.error("Failed to download video:", err);
                      window.open(videoUrl, "_blank"); // Fallback
                    }
                  }}
                >
                  <Download className="mr-2 size-4" />
                  Download MP4
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleExport} 
                  disabled={isExporting || isGenerating}
                  style={{ background: "oklch(0.65 0.22 285)" }}
                >
                  {isExporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
