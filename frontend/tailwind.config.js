/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',      // iPhone 14 最小寬度
      'sm': '640px',      // 平板小尺寸
      'md': '768px',      // 平板
      'lg': '1024px',     // 桌面小尺寸
      'xl': '1280px',     // 桌面
      '2xl': '1536px',    // 大桌面
      // iPhone 14 特定斷點
      'iphone': {'min': '375px', 'max': '414px'},  // iPhone 14 範圍
      'iphone-h': {'raw': '(min-width: 375px) and (max-width: 414px) and (orientation: landscape)'}, // iPhone 橫屏
    },
    extend: {
      // iPhone 14 特定的間距和尺寸
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'touch': '44px',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      // iPhone 14 優化的字體大小
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg-mobile': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      },
      // iPhone 14 優化的按鈕尺寸（至少44px高度符合Apple建議）
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}