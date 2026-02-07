"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Section as SectionType } from "@/types/blocks/section";

export default function FAQ({ section }: { section: SectionType }) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  if (section.disabled) {
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id={section.name} className="relative py-24 overflow-hidden">
      {/* 现代背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/80 dark:from-gray-900 dark:via-slate-900/80 dark:to-indigo-950/50" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse animation-delay-400" />
      
      <div className="container relative z-10">
        <div className="text-center animate-fade-in-up">
          {section.label && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6">
              {section.label}
            </div>
          )}
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-indigo-200 lg:text-5xl mb-6">
            {section.title}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground/80 leading-relaxed">
            {section.description}
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-4xl">
          {section.items?.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div 
                key={index} 
                className={`group mb-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up overflow-hidden`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors duration-300"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-sm text-white shadow-lg">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                  </div>
                  <ChevronDown 
                    className={`size-5 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <div className={`transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}>
                  <div className="px-6 pb-6 pl-18">
                    <div className="w-full h-px bg-gradient-to-r from-blue-200/50 via-indigo-200/50 to-purple-200/50 dark:from-blue-700/50 dark:via-indigo-700/50 dark:to-purple-700/50 mb-4" />
                    <p className="text-muted-foreground/90 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* 悬停效果 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover:from-blue-400/5 group-hover:via-indigo-400/5 group-hover:to-purple-400/5 transition-all duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
