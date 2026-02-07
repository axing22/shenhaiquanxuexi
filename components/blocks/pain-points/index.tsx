'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export interface PainPointProblem {
  icon: string;
  title: string;
  description: string;
  details: string[];
  stat: string;
  statLabel: string;
}

export interface PainPointsData {
  name: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  problems: PainPointProblem[];
  solution: {
    title: string;
    description: string;
    cta: string;
  };
  comparison?: {
    traditional_method: string;
    deep_video: string;
    traditional_cost: string;
    time_72h: string;
    time_5min: string;
    cost_5000: string;
    cost_5: string;
  };
}

interface PainPointsProps {
  section: PainPointsData;
}

export function PainPoints({ section }: PainPointsProps) {
  const problems = section.problems;

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="container mx-auto px-4">
        {/* 头部引导 */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-950 rounded-full mb-6">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {section.subtitle}
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {section.title}
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 italic">
            {section.description}
          </p>
        </div>

        {/* 痛点卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {problems.map((problem, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-2 hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 group"
            >
              <CardContent className="p-8">
                {/* 图标和统计 */}
                <div className="flex justify-between items-start mb-6">
                  <div className="text-5xl">{problem.icon}</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-500 dark:text-red-400">
                      {problem.stat}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {problem.statLabel}
                    </div>
                  </div>
                </div>

                {/* 标题和描述 */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {problem.description}
                </p>

                {/* 详细痛点 */}
                <ul className="space-y-2">
                  {problem.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span className="text-red-400 mt-1">✗</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* 背景装饰 */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950 dark:to-red-900 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 解决方案引导 */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              {section.solution.title}
            </h3>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {section.solution.description}
          </p>
          <Link href="/">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              {section.solution.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* 底部统计对比 */}
        {section.comparison && (
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{section.comparison.traditional_method}</div>
              <div className="text-2xl font-bold text-red-500 line-through">{section.comparison.time_72h}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{section.comparison.deep_video}</div>
              <div className="text-2xl font-bold text-green-500">{section.comparison.time_5min}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{section.comparison.traditional_cost}</div>
              <div className="text-2xl font-bold text-red-500 line-through">{section.comparison.cost_5000}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{section.comparison.deep_video}</div>
              <div className="text-2xl font-bold text-green-500">{section.comparison.cost_5}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}