import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				red: '#81120F',
  				cream: '#FDFAD5',
				grey: '#E8E5E5',
  			},
  			neutral: {
  				lightest: '#EEEEEE',
  				lighter: '#CCCCCC',
  				light: '#AAAAAA',
  				DEFAULT: '#666666',
  				dark: '#444444',
  				darker: '#222222',
  				darkest: '#111111'
  			},
  			success: {
  				DEFAULT: '#027A48',
  				light: '#ECFDF3'
  			},
  			error: {
  				DEFAULT: '#B42318',
  				light: '#FEF3F2'
  			}
  		},
  		fontSize: {
  			xl: [
  				'20px',
  				'1.5'
  			],
  			lg: [
  				'18px',
  				'1.5'
  			],
  			base: [
  				'16px',
  				'1.5'
  			],
  			sm: [
  				'14px',
  				'1.5'
  			],
  			xs: [
  				'12px',
  				'1.5'
  			]
  		},
  		boxShadow: {
  			xxs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			xs: '0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			sm: '0 2px 4px -2px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.1)',
  			md: '0 4px 6px -2px rgba(0, 0, 0, 0.03), 0 12px 16px -4px rgba(0, 0, 0, 0.08)',
  			lg: '0 8px 8px -4px rgba(0, 0, 0, 0.03), 0 20px 24px -4px rgba(0, 0, 0, 0.08)',
  			xl: '0 24px 48px -12px rgba(0, 0, 0, 0.18)',
  			xxl: '0 32px 64px -12px rgba(0, 0, 0, 0.14)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
