"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface TabsProps {
  tabs: { id: string; label: string; content: ReactNode }[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const activeContent = tabs.find((t) => t.id === activeTab)?.content
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-neutral-900 dark:hover:text-neutral-100",
              activeTab === tab.id
                ? "text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100"
                : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">{activeContent}</div>
    </div>
  )
}
