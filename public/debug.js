// Helper script to debug issues with GitHub Pages deployment
(function () {
    console.log('Debug script loaded');

    // Log environment info
    console.log('URL:', window.location.href);
    console.log('Base URL:', document.querySelector('base')?.href || 'No base tag found');

    // Auto redirect to root if in a sub-folder and not using a hash router
    if (window.location.pathname !== '/' && !window.location.hash && !window.location.pathname.endsWith('.html')) {
        console.log('Redirecting to root from:', window.location.pathname);
        window.location.href = '/';
        return;
    }

    // Check for common errors
    setTimeout(() => {
        // Check if root element has content
        const rootContent = document.getElementById('root');
        console.log('Root element has content:', rootContent?.children.length > 0);

        // If root doesn't have content after 5 seconds, try to reload the page
        if (!rootContent || rootContent.children.length === 0) {
            console.log('Root element is empty, reloading...');

            // Add a storage flag to prevent infinite reload loops
            if (!sessionStorage.getItem('reloaded')) {
                sessionStorage.setItem('reloaded', 'true');
                window.location.reload();
            } else {
                console.error('Page reload did not fix the issue. Check developer console for errors.');
            }
        }

        // Check for 404 errors on resources
        const failedResources = Array.from(document.querySelectorAll('link, script'))
            .filter(el => {
                const resourceURL = el.getAttribute('href') || el.getAttribute('src');
                return resourceURL && !el.complete;
            });

        console.log('Failed resources:', failedResources.length > 0 ? failedResources : 'None');
    }, 2000);
})(); 