"use client"

import { useState, useEffect } from "react"
import { Check, Sparkles, Zap } from "lucide-react"
import { getUserCredits } from "@/app/actions/get-user-credits"

const plans = [
  {
    name: "Starter",
    price: "$9",
    credits: "50 Credits",
    features: ["Standard generation speed", "720p Exports", "Community Support"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    credits: "200 Credits",
    features: ["Fast generation", "1080p Exports", "Priority Support", "Remove Watermark"],
    popular: true,
  },
  {
    name: "Max",
    price: "$99",
    credits: "1000 Credits",
    features: ["Lightning generation", "4K Exports", "Dedicated Account Manager", "API Access"],
    popular: false,
  }
]

export function BillingDashboard() {
  const [credits, setCredits] = useState<number | null>(null)
  
  useEffect(() => {
    getUserCredits().then(setCredits)
  }, [])

  return (
    <div className="space-y-10 w-full max-w-4xl mx-auto py-2">
      {/* Current Credits Widget */}
      <div 
        className="rounded-2xl p-6 relative overflow-hidden glass animate-fade-in-up"
        style={{
          animationDuration: "0.5s",
          animationFillMode: "forwards",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.22 285 / 0.12) 0%, transparent 60%)",
            filter: "blur(40px)",
            marginRight: "-40px",
            marginTop: "-40px",
          }}
          aria-hidden
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1 flex items-center gap-2">
              <Zap className="size-5" style={{ color: "oklch(0.72 0.20 200)" }} />
              Available Credits
            </h3>
            <p className="text-sm text-muted-foreground">Used for generating and exporting videos.</p>
          </div>
          <div
            className="text-4xl font-bold tracking-tight text-neon"
            style={{ color: "oklch(0.96 0.005 285)" }}
          >
            {credits === null ? "…" : credits}
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div>
        <div className="mb-8 text-center">
          <h2
            className="text-2xl font-bold text-foreground mb-2"
            style={{ fontFamily: "var(--font-display, 'Space Grotesk', system-ui)" }}
          >
            Buy Extra Credits
          </h2>
          <p className="text-sm text-muted-foreground">Choose a plan that fits your creative needs.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div 
              key={plan.name}
              className="relative rounded-2xl p-6 flex flex-col glow-border card-hover cursor-pointer animate-fade-in-up opacity-0"
              style={{
                background: plan.popular
                  ? "linear-gradient(180deg, oklch(0.65 0.22 285 / 0.08) 0%, oklch(0.09 0.014 285) 100%)"
                  : "oklch(0.09 0.014 285)",
                border: plan.popular
                  ? "1px solid oklch(0.65 0.22 285 / 0.25)"
                  : "1px solid oklch(1 0 0 / 0.06)",
                boxShadow: plan.popular
                  ? "0 0 30px oklch(0.65 0.22 285 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.06)"
                  : "inset 0 1px 0 oklch(1 0 0 / 0.05)",
                animationDelay: `${i * 120}ms`,
                animationFillMode: "forwards",
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200))",
                    boxShadow: "0 0 16px oklch(0.65 0.22 285 / 0.30)",
                  }}
                >
                  <Sparkles className="size-3" /> Most Popular
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              
              <div
                className="py-4 mb-4"
                style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)", borderBottom: "1px solid oklch(1 0 0 / 0.06)" }}
              >
                <div className="text-lg font-semibold" style={{ color: "oklch(0.72 0.20 200)" }}>{plan.credits}</div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 mt-0.5 shrink-0" style={{ color: "oklch(0.72 0.18 155)" }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full h-10 rounded-xl font-medium text-sm cursor-pointer btn-press transition-all duration-300 ${
                  plan.popular 
                    ? 'text-white' 
                    : 'text-foreground'
                }`}
                style={plan.popular ? {
                  background: "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200), oklch(0.75 0.25 330))",
                  boxShadow: "0 0 20px oklch(0.65 0.22 285 / 0.25)",
                } : {
                  background: "oklch(1 0 0 / 0.06)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                }}
                onClick={() => alert('Stripe Checkout will open here. Currently in UI mode.')}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
