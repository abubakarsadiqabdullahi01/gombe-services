/**
 * Tailwind CSS Configuration for gombe-services
 * This file enables Tailwind CSS utility classes throughout your app.
 * You can customize the theme, extend colors, add plugins, etc.
 * Docs: https://tailwindcss.com/docs/configuration
 */

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {}, // You can extend the default Tailwind theme here
  },
  plugins: [], // Add Tailwind plugins here if needed
};
