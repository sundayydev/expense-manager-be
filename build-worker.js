/**
 * Build script để bundle NestJS app thành Cloudflare Workers bundle
 * sử dụng esbuild - bundler nhanh và nhẹ
 */

const esbuild = require('esbuild');
const path = require('path');

const isDev = process.argv.includes('--dev');

esbuild
  .build({
    // Entry point là worker.ts (không phải main.ts)
    entryPoints: [path.resolve(__dirname, 'src/worker.ts')],

    // Output file phải khớp với `main` trong wrangler.jsonc
    outfile: path.resolve(__dirname, 'dist/worker.js'),

    // Bundle tất cả dependencies vào một file duy nhất
    bundle: true,

    // Cloudflare Workers dùng format ESM
    format: 'esm',

    // Target: Workers edge runtime
    platform: 'browser',

    // Minify trong production để giảm kích thước
    minify: !isDev,

    // Source maps để debug (chỉ trong dev)
    sourcemap: isDev ? 'inline' : false,

    // Các package không cần bundle (Workers runtime cung cấp sẵn)
    external: [
      // Workers có crypto, fetch built-in
    ],

    // Định nghĩa biến môi trường compile-time
    define: {
      'process.env.CLOUDFLARE_WORKERS': '"true"',
    },

    // Resolve TypeScript paths
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),

    // Xử lý các assets
    loader: {
      '.ts': 'ts',
    },

    // Log level
    logLevel: 'info',
  })
  .then(() => {
    console.log('✅ Worker bundle built successfully!');
    console.log('📦 Output: dist/worker.js');
    if (!isDev) {
      console.log('🚀 Ready to deploy with: pnpm run deploy');
    }
  })
  .catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
