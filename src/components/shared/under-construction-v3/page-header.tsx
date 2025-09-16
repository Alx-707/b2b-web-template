import React from 'react';
import { Zap } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className='space-y-8'>
      {/* 状态图标 - 简化版 */}
      <div className='flex justify-center'>
        <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full'>
          <Zap className='text-primary h-8 w-8' />
        </div>
      </div>

      {/* 标题和描述 - 优化版 */}
      <div className='space-y-6'>
        <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl'>
          {title}
        </h1>

        <p className='text-muted-foreground mx-auto max-w-md text-base leading-relaxed md:text-lg'>
          {description}
        </p>
      </div>
    </div>
  );
}
