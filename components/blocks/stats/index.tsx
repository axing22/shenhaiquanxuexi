import { Heart, Zap } from "lucide-react";

import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Stats({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="relative py-24 overflow-hidden">
      {/* 现代背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-cyan-50/80 dark:from-gray-900 dark:via-indigo-950/50 dark:to-gray-900" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      {/* 装饰性元素 */}
      <div className="absolute top-1/3 left-10 w-32 h-32 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-1/3 right-10 w-40 h-40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse animation-delay-600" />
      
      <div className="container relative z-10 flex flex-col items-center gap-6">
        {section.label && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-sm font-semibold text-indigo-600 dark:text-indigo-400 animate-fade-in">
            {section.icon && (
              <Icon name={section.icon} className="h-5 w-5" />
            )}
            {section.label}
          </div>
        )}
        
        <div className="text-center animate-fade-in-up animation-delay-200">
          <h2 className="mb-4 text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-cyan-800 bg-clip-text text-transparent dark:from-white dark:via-indigo-200 dark:to-cyan-200 lg:text-5xl">
            {section.title}
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
            {section.description}
          </p>
        </div>
        
        <div className="w-full grid gap-8 md:grid-cols-3 mt-12">
          {section.items?.map((item, index) => {
            return (
              <div 
                key={index} 
                className={`group relative text-center p-8 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up`}
                style={{ animationDelay: `${(index + 1) * 0.2}s` }}
              >
                {/* 卡片背景渐变 */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/30 dark:to-cyan-950/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-4">
                    {item.title}
                  </p>
                  
                  {/* 数字显示 */}
                  <div className="relative mb-4">
                    <p className="text-6xl lg:text-7xl font-bold bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                      {item.label}
                    </p>
                    {/* 数字光晕效果 */}
                    <div className="absolute inset-0 text-6xl lg:text-7xl font-bold text-indigo-500/20 blur-sm group-hover:text-indigo-500/40 transition-all duration-500">
                      {item.label}
                    </div>
                  </div>
                  
                  <p className="text-base text-muted-foreground/90 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                {/* 悬停效果 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/0 via-purple-400/0 to-cyan-400/0 group-hover:from-indigo-400/5 group-hover:via-purple-400/5 group-hover:to-cyan-400/5 transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
