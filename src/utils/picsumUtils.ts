import { DEFAULT_IMAGE_SIZE, PICSUM_BASE_URL } from '../constants';

export interface PicsumImageOptions {
  width?: number;
  height?: number;
  seed?: string;
}

export const PicsumUtils = {
  generateSeededUrl: (options: PicsumImageOptions = {}): string => {
    const {
      width = DEFAULT_IMAGE_SIZE,
      height = DEFAULT_IMAGE_SIZE,
      seed = `recipe-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    } = options;

    return `${PICSUM_BASE_URL}/seed/${seed}/${width}/${height}`;
  },
} as const;

export default PicsumUtils;
