// Helper script to debug issues with GitHub Pages deployment
(function() {
  console.log('Debug script loaded');
  
  // Log environment info
  console.log('URL:', window.location.href);
  console.log('Base URL:', document.querySelector('base')?.href || 'No base tag found');
  
  // Check for common errors
  setTimeout(() => {
    // Check if root element has content
    const rootContent = document.getElementById('root');
    console.log('Root element has content:', rootContent?.children.length > 0);
    
    // Check for 404 errors on resources
    const failedResources = Array.from(document.querySelectorAll('link, script'))
      .filter(el => {
        const resourceURL = el.getAttribute('href') || el.getAttribute('src');
        return resourceURL && !el.complete;
      });
    
    console.log('Failed resources:', failedResources.length > 0 ? failedResources : 'None');
  }, 2000);
})(); 