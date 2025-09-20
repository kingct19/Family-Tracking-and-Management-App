module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ['http://localhost:3000'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'max-potential-fid': ['error', { maxNumericValue: 100 }],
        'uses-responsive-images': 'error',
        'uses-optimized-images': 'error',
        'uses-webp-images': 'error',
        'efficient-animated-content': 'error',
        'offscreen-images': 'error',
        'render-blocking-resources': 'error',
        'unused-css-rules': 'error',
        'unused-javascript': 'error',
        'modern-image-formats': 'error',
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'error',
        'uses-rel-preload': 'error',
        'font-display': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
