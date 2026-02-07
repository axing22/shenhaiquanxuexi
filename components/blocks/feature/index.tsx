import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="relative py-24 overflow-hidden">
      {/* 现代背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-400" />
      
      <div className="container relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center animate-fade-in-up">
          <h2 className="mb-4 text-pretty text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 lg:text-5xl">
            {section.title}
          </h2>
          <p className="mb-12 max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
            {section.description}
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div 
              key={i} 
              className={`group relative flex flex-col p-8 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* 卡片背景渐变 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {item.icon && (
                  <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
                    <Icon name={item.icon} className="size-10 text-white" />
                  </div>
                )}
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-muted-foreground/90 leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              {/* 悬停效果光晕 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
