const fs = require('fs');
const path = require('path');

const files = [
    'frontend/dashboard.html',
    'frontend/leads.html',
    'frontend/kanban.html',
    'frontend/analytics.html'
];

const requirements = [
    {
        pattern: /<body[^>]*class="[^"]*bg-gray-50[^"]*dark:bg-secondary-900[^"]*text-gray-900[^"]*dark:text-gray-100[^"]*min-h-screen/,
        description: 'Body class includes bg-gray-50 dark:bg-secondary-900 text-gray-900 dark:text-gray-100 min-h-screen'
    },
    {
        pattern: /<aside[^>]*class="[^"]*dark:bg-secondary-800/,
        description: 'Aside includes dark:bg-secondary-800'
    },
    {
        pattern: /localStorage\.getItem\('darkMode'\)/,
        description: 'Dark mode localStorage check exists'
    },
    {
        pattern: /html\.classList\.add\('dark'\)/,
        description: 'Adds dark class to html'
    },
    {
        pattern: /darkModeIcon\.className = .*fas fa-sun/,
        description: 'Icon updates to sun'
    }
];

let allPassed = true;

files.forEach(file => {
    console.log(`\n=== Checking ${file} ===`);
    if (!fs.existsSync(file)) {
        console.error('  File not found');
        allPassed = false;
        return;
    }
    const content = fs.readFileSync(file, 'utf8');
    
    // Check body class
    const bodyMatch = content.match(/<body[^>]*class="([^"]*)"/);
    if (bodyMatch) {
        const bodyClass = bodyMatch[1];
        if (bodyClass.includes('dark:bg-secondary-900') && bodyClass.includes('bg-gray-50') && bodyClass.includes('text-gray-900') && bodyClass.includes('dark:text-gray-100') && bodyClass.includes('min-h-screen')) {
            console.log('  ✓ Body class correct');
        } else {
            console.log('  ✗ Body class missing required classes');
            console.log('    Found:', bodyClass);
            allPassed = false;
        }
    } else {
        console.log('  ✗ No body tag found');
        allPassed = false;
    }
    
    // Check aside class
    const asideMatch = content.match(/<aside[^>]*class="([^"]*)"/);
    if (asideMatch) {
        const asideClass = asideMatch[1];
        if (asideClass.includes('dark:bg-secondary-800')) {
            console.log('  ✓ Aside includes dark:bg-secondary-800');
        } else {
            console.log('  ✗ Aside missing dark:bg-secondary-800');
            allPassed = false;
        }
    } else {
        console.log('  ✗ No aside tag found');
        allPassed = false;
    }
    
    // Check dark mode initialization script
    if (content.includes("localStorage.getItem('darkMode')")) {
        console.log('  ✓ localStorage check present');
    } else {
        console.log('  ✗ localStorage check missing');
        allPassed = false;
    }
    
    if (content.includes("html.classList.add('dark')") || content.includes("document.documentElement.classList.add('dark')")) {
        console.log('  ✓ Adds dark class to html');
    } else {
        console.log('  ✗ Missing dark class addition');
        allPassed = false;
    }
    
    if (content.includes("fas fa-sun")) {
        console.log('  ✓ Sun icon present');
    } else {
        console.log('  ✗ Sun icon missing');
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\n✅ All dark mode checks passed!');
    process.exit(0);
} else {
    console.log('\n❌ Some checks failed.');
    process.exit(1);
}