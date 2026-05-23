import { z } from 'zod';
import { extractYouTubeVideoId, timeToSeconds } from '@/lib/youtube-utils';

export const productVariantInputSchema = z.object({
  variantData: z.record(z.string(), z.unknown()).default({}),
  stock: z.number().min(0).default(0),
  price: z.number().optional(),
});

/** Payload fields for create — same shape as `vendor.products.create` (no vendor id). */
export const productCreateBodySchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.unknown().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  image: z.string().optional(),
  cover: z.array(z.string()).optional(),
  videoSource: z.enum(['upload', 'youtube']).optional(),
  video: z.string().optional(),
  youtubeUrl: z.string().optional(),
  youtubeStartTime: z.string().optional(),
  refundPolicy: z
    .enum(['30-day', '14-day', '7-day', '3-day', '1-day', 'no-refunds'])
    .optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(productVariantInputSchema).optional(),
  isPrivate: z.boolean().default(true),
});

export const staffProductCreateInputSchema = productCreateBodySchema.extend({
  vendor: z.string().min(1, 'Vendor is required'),
});

export type ProductCreateBody = z.infer<typeof productCreateBodySchema>;
export type StaffProductCreateInput = z.infer<typeof staffProductCreateInputSchema>;

export function processProductCreateInput<T extends ProductCreateBody>(input: T): T & Record<string, unknown> {
  if (input.videoSource === 'youtube' && input.youtubeUrl) {
    const videoId = extractYouTubeVideoId(input.youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please provide a valid YouTube video URL.');
    }

    let startTimeSeconds: number | undefined;
    if (input.youtubeStartTime) {
      const seconds = timeToSeconds(input.youtubeStartTime);
      if (seconds === null) {
        throw new Error(
          'Invalid time format. Please use MM:SS format (e.g., 2:05 for 2 minutes 5 seconds).',
        );
      }
      startTimeSeconds = seconds;
    }

    return {
      ...input,
      youtubeVideoId: videoId,
      youtubeStartTimeSeconds: startTimeSeconds,
    };
  }

  if (input.videoSource === 'upload' || !input.videoSource) {
    return {
      ...input,
      youtubeUrl: undefined,
      youtubeVideoId: undefined,
      youtubeStartTime: undefined,
      youtubeStartTimeSeconds: undefined,
    };
  }

  return { ...input };
}
