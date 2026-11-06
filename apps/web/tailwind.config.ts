import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Lora', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                ivory: '#F7F4EF',
                sage: '#87958A',
                forest: '#34463D',
                sand: '#D8C5AA',
                charcoal: '#343434',
            },
        },
    },
    plugins: [],
} satisfies Config;