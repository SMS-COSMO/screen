<template>
  <div :class="cn(badgeVariants({ variant }), $attrs.class ?? '')">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

defineProps<Props>();

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // 为了适应审核颜色, 特地添加颜色变体.
        c_created: 'border-transparent bg-[#6B7280] text-primary-foreground hover:bg-[#6B7280]/80',
        c_approved: 'border-transparent bg-[#10B981] text-primary-foreground hover:bg-[#10B981]/80',
        c_rejected: 'border-transparent bg-[#EF4444] text-primary-foreground hover:bg-[#EF4444]/80',
        c_inuse: 'border-transparent bg-[#3B82F6] text-primary-foreground hover:bg-[#3B82F6]/80',
        c_outdated: 'border-transparent bg-[#F59E0B] text-primary-foreground hover:bg-[#F59E0B]/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeVariantProps extends VariantProps<typeof badgeVariants> {}

interface Props {
  variant?: BadgeVariantProps['variant'];
}
</script>
