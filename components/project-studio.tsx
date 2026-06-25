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
        const renderedChildren = renderThemeEditor(value, currentPath);
        const validChildren = Array.isArray(renderedChildren) 
          ? renderedChildren.filter(Boolean) 
          : renderedChildren;
          
        if (!validChildren || (Array.isArray(validChildren) && validChildren.length === 0)) return null;

        return (
          <div key={fieldId} className="space-y-3 mt-4 border-l-2 pl-4 ml-1" style={{ borderColor: "oklch(1 0 0 / 0.06)" }}>
            <h4 className="text-sm font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
            <div className="space-y-4">
              {validChildren}
            </div>
          </div>
        );
      }
      
      const isColor = typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl") || key.toLowerCase().includes("color"));
      const isFont = key.toLowerCase().includes("font");
      
      if (!isColor && !isFont) return null;

      return (
        <div key={fieldId} className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {isColor ? (
            <div className="flex items-center gap-3">
              <div
                className="relative size-8 rounded-lg overflow-hidden shrink-0"
                style={{ border: "1px solid oklch(1 0 0 / 0.12)" }}
              >
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
                className="flex-1 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1"
                style={{
                  background: "oklch(1 0 0 / 0.04)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                }}
              />
            </div>
          ) : (
            <div className="relative">
              <select
                value={String(value)}
                onChange={(e) => updateNestedTheme(currentPath, e.target.value)}
                className="w-full rounded-lg pl-3 pr-8 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 appearance-none cursor-pointer"
                style={{
                  background: "oklch(1 0 0 / 0.04)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                }}
              >
                <option value={String(value)} style={{ background: "oklch(0.09 0.014 285)" }}>{String(value)}</option>
                <option value="Inter" style={{ background: "oklch(0.09 0.014 285)" }}>Inter</option>
                <option value="Roboto" style={{ background: "oklch(0.09 0.014 285)" }}>Roboto</option>
                <option value="Outfit" style={{ background: "oklch(0.09 0.014 285)" }}>Outfit</option>
                <option value="Playfair Display" style={{ background: "oklch(0.09 0.014 285)" }}>Playfair Display</option>
                <option value="Montserrat" style={{ background: "oklch(0.09 0.014 285)" }}>Montserrat</option>
                <option value="Space Grotesk" style={{ background: "oklch(0.09 0.014 285)" }}>Space Grotesk</option>
                <option value="DM Sans" style={{ background: "oklch(0.09 0.014 285)" }}>DM Sans</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
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
      <aside
        className="w-80 lg:w-96 flex flex-col shrink-0"
        style={{
          background: "oklch(0.06 0.013 285)",
          borderRight: "1px solid oklch(1 0 0 / 0.05)",
        }}
      >
        {/* Tabs */}
        <div
          className="flex items-center p-2 gap-1"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.05)" }}
        >
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl cursor-pointer",
              "transition-all duration-300",
              activeTab === "chat" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activeTab === "chat" ? {
              background: "linear-gradient(135deg, oklch(0.65 0.22 285 / 0.15), oklch(0.72 0.20 200 / 0.08))",
              boxShadow: "0 0 12px oklch(0.65 0.22 285 / 0.10), inset 0 1px 0 oklch(1 0 0 / 0.05)",
              border: "1px solid oklch(0.65 0.22 285 / 0.15)",
            } : {
              background: "transparent",
              border: "1px solid transparent",
            }}
          >
            <MessageSquare className="size-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl cursor-pointer",
              "transition-all duration-300",
              activeTab === "theme" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activeTab === "theme" ? {
              background: "linear-gradient(135deg, oklch(0.65 0.22 285 / 0.15), oklch(0.72 0.20 200 / 0.08))",
              boxShadow: "0 0 12px oklch(0.65 0.22 285 / 0.10), inset 0 1px 0 oklch(1 0 0 / 0.05)",
              border: "1px solid oklch(0.65 0.22 285 / 0.15)",
            } : {
              background: "transparent",
              border: "1px solid transparent",
            }}
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
                  <div
                    key={idx}
                    className={cn(
                      "flex w-full animate-fade-in-up",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                    style={{
                      animationDuration: "0.3s",
                      animationDelay: "0ms",
                    }}
                  >
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user" 
                        ? "rounded-tr-sm" 
                        : "rounded-tl-sm"
                    )}
                    style={msg.role === "user" ? {
                      background: "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200))",
                      color: "oklch(0.98 0.002 285)",
                      boxShadow: "0 4px 16px oklch(0.65 0.22 285 / 0.20)",
                    } : {
                      background: "oklch(1 0 0 / 0.04)",
                      border: "1px solid oklch(1 0 0 / 0.06)",
                      color: "oklch(0.90 0.005 285)",
                      boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.04)",
                    }}
                    >
                      {msg.role === "assistant" && <Sparkles className="size-3 mb-1.5" style={{ color: "oklch(0.72 0.20 200)" }} />}
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div
                className="p-3"
                style={{
                  borderTop: "1px solid oklch(1 0 0 / 0.05)",
                  background: "oklch(0.06 0.013 285 / 0.90)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <form 
                  onSubmit={handleSubmit}
                  className="relative flex items-end glass rounded-[1.25rem] p-1.5 glow-focus"
                >
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKey}
                    placeholder="Chat with AI to refine..."
                    className="w-full max-h-32 min-h-[40px] resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="shrink-0 size-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer btn-press mb-0.5 mr-0.5"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200))",
                      boxShadow: input.trim() ? "0 0 12px oklch(0.65 0.22 285 / 0.30)" : "none",
                      transition: "box-shadow 0.3s ease, opacity 0.3s ease, transform 0.15s ease",
                    }}
                  >
                    <Send className="size-4 -ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="size-5" style={{ color: "oklch(0.72 0.20 200)" }} />
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
      <main
        className="flex-1 overflow-y-auto p-6 lg:p-10 relative flex flex-col"
        style={{ background: "oklch(0.05 0.012 285)" }}
      >
        {/* Ambient neon glow for the main area */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.22 285 / 0.06) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          aria-hidden
        />

        <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
          
          {/* Header Metadata */}
          <div className="animate-fade-in-up" style={{ animationDuration: "0.5s" }}>
            <h1
              className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-3"
              style={{ fontFamily: "var(--font-display, 'Space Grotesk', system-ui)" }}
            >
              {project.title}
            </h1>
            <div className="flex items-center gap-4 text-sm flex-wrap" style={{ color: "oklch(0.50 0.010 285)" }}>
              {project.author && (
                <div className="flex items-center gap-2">
                  <div 
                    className="size-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                    style={{
                      background: project.author.avatarGradient,
                      boxShadow: "0 0 8px oklch(0.65 0.22 285 / 0.15)",
                    }}
                  >
                    {project.author.initial}
                  </div>
                  <span className="font-medium text-foreground">{project.author.name}</span>
                </div>
              )}
              <span style={{ color: "oklch(0.35 0.006 285)" }}>•</span>
              <span>{formattedDate}</span>
              <span style={{ color: "oklch(0.35 0.006 285)" }}>•</span>
              <span>{project.ratio}</span>
              <span style={{ color: "oklch(0.35 0.006 285)" }}>•</span>
              <span>{project.duration}</span>
            </div>
          </div>

          {/* Video Player Stage */}
          <div 
            className="relative w-full overflow-hidden rounded-2xl flex items-center justify-center group animate-fade-in-scale"
            style={{
              aspectRatio: project.ratio === "16:9" ? "16/9" : "9/16",
              maxHeight: project.ratio === "9:16" ? "70vh" : "auto",
              background: "oklch(0.03 0.010 285)",
              border: "1px solid oklch(1 0 0 / 0.06)",
              boxShadow: "0 25px 60px -12px oklch(0 0 0 / 0.6), 0 0 40px oklch(0.65 0.22 285 / 0.05)",
              animationDuration: "0.6s",
              animationDelay: "0.1s",
            }}
          >
            {/* Exporting Overlay */}
            {isExporting && (
              <div
                className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl"
                style={{
                  background: "oklch(0.05 0.012 285 / 0.85)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="flex flex-col items-center gap-6 max-w-sm w-full p-8 rounded-2xl glass"
                  style={{
                    boxShadow: "0 0 40px oklch(0.65 0.22 285 / 0.10)",
                  }}
                >
                  <div className="relative flex items-center justify-center size-20 rounded-full" style={{ background: "oklch(0.65 0.22 285 / 0.10)" }}>
                    <Download className="size-10 animate-pulse" style={{ color: "oklch(0.65 0.22 285)" }} />
                    <Loader2 className="absolute inset-0 size-full animate-spin" style={{ color: "oklch(0.65 0.22 285 / 0.30)" }} strokeWidth={1} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Rendering Video</h3>
                    <p className="text-sm text-muted-foreground">
                      Your video is being rendered in the cloud. This might take a minute…
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isGenerating ? (
              // Generating State
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" style={{ background: project.thumbnailGradient }}>
                <div
                  className="absolute inset-0"
                  style={{
                    background: "oklch(0 0 0 / 0.65)",
                    backdropFilter: "blur(4px)",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                  <Loader2 className="size-10 text-white animate-spin mb-6" />
                  
                  <div className="w-full space-y-4">
                    {GENERATION_STEPS.map((step, idx) => {
                      const isComplete = idx < currentStepIndex
                      const isCurrent = idx === currentStepIndex

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center gap-3 text-sm font-medium transition-all duration-500",
                            isComplete ? "text-white/60" : isCurrent ? "text-white scale-105" : "text-white/20"
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="size-4 shrink-0" style={{ color: "oklch(0.72 0.18 155)" }} />
                          ) : isCurrent ? (
                            <Loader2 className="size-4 animate-spin shrink-0" style={{ color: "oklch(0.72 0.20 200)" }} />
                          ) : (
                            <div
                              className="size-4 rounded-full shrink-0"
                              style={{ border: "2px solid oklch(1 0 0 / 0.15)" }}
                            />
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
                <button className="relative z-10 size-20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer btn-press"
                  style={{
                    background: "oklch(0 0 0 / 0.35)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid oklch(1 0 0 / 0.15)",
                    boxShadow: "0 0 24px oklch(0.65 0.22 285 / 0.20)",
                  }}
                >
                  <Play className="size-8 ml-1" fill="currentColor" />
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div
            className="flex items-center justify-between pt-6"
            style={{ borderTop: "1px solid oklch(1 0 0 / 0.05)" }}
          >
            <div className="flex items-center gap-4 text-sm font-medium" style={{ color: "oklch(0.45 0.008 285)" }}>
              <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors duration-300">
                <Eye className="size-4" />
                {project.views}
              </div>
              <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors duration-300">
                <Heart className="size-4" />
                {project.likes}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex cursor-pointer btn-press rounded-xl"
                style={{
                  background: "oklch(1 0 0 / 0.04)",
                  borderColor: "oklch(1 0 0 / 0.08)",
                }}
              >
                <Share2 className="mr-2 size-4" />
                Share
              </Button>
              {videoUrl ? (
                <Button 
                  size="sm"
                  className="cursor-pointer btn-press rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200))",
                    boxShadow: "0 0 16px oklch(0.65 0.22 285 / 0.25)",
                  }}
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
                  className="cursor-pointer btn-press rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200))",
                    boxShadow: "0 0 16px oklch(0.65 0.22 285 / 0.25)",
                  }}
                >
                  {isExporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
                  {isExporting ? "Exporting…" : "Export"}
                </Button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
