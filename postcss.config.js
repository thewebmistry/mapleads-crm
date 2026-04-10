/**
 * PostCSS Configuration for MapLeads CRM
 * 
 * PostCSS is a tool for transforming CSS with JavaScript plugins.
 * This configuration processes Tailwind CSS and adds vendor prefixes.
 * 
 * @type {import('postcss').ProcessOptions}
 */
module.exports = {
  plugins: {
    /**
     * Tailwind CSS plugin
     * Processes Tailwind directives and generates utility classes
     */
    tailwindcss: {},
    
    /**
     * Autoprefixer plugin
     * Adds vendor prefixes to CSS rules for better browser compatibility
     */
    autoprefixer: {},
    
    /**
     * CSSNano (optional - for production)
     * Minifies CSS and optimizes for production
     * Uncomment for production builds
     */
    // cssnano: {
    //   preset: 'default',
    // },
  },
};