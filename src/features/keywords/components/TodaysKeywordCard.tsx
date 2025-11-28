import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TodaysKeywordCard({
  keywordName,
  keywordDesc,
}: {
  keywordName: string;
  keywordDesc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className='mx-auto my-3 w-full max-w-3xl'
    >
      <Card
        role='region'
        aria-label='오늘의 키워드'
        className='relative overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md'
      >
        <div aria-hidden className='pointer-events-none absolute inset-0'>
          <div className='absolute -top-10 right-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl' />
          <div className='absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-muted/20 blur-3xl' />
        </div>

        <CardHeader className='px-4 py-0'>
          <div className='flex items-center justify-center gap-2'>
            <Search className='h-4 w-4' aria-hidden='true' />
            <CardTitle className='text-sm sm:text-base font-extrabold tracking-tight'>
              오늘의 키워드
            </CardTitle>
            <Sparkles className='h-4 w-4 opacity-25' aria-hidden='true' />
          </div>
          <CardDescription className='sr-only'>
            오늘의 핵심 키워드 정보를 제공합니다
          </CardDescription>
        </CardHeader>

        <div className='mx-4 my-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent' />

        <CardContent className='px-4 py-1'>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-col items-center justify-center gap-2 text-center'>
              <Badge
                variant='secondary'
                className='rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-semibold'
              >
                KEYWORD
              </Badge>
              <h2 className='text-xl sm:text-2xl font-extrabold leading-tight text-primary'>
                {keywordName}
              </h2>
              <Sparkles className='h-3.5 w-3.5 opacity-50' aria-hidden='true' />
            </div>

            <p className='text-sm leading-relaxed font-medium text-pretty'>
              {keywordDesc}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
