import React, { useState, useRef, useEffect } from 'react';
import { Github, ExternalLink, FileCode, Code, X, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, CodeExample, SectionProps } from '../lib/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download } from 'lucide-react';

interface ProjectsCarouselProps extends SectionProps {
    projects: Project[];
}

interface CodeContent {
    content: string;
    loading: boolean;
    error: string | null;
}

const ProjectsCarousel: React.FC<ProjectsCarouselProps> = ({ projects, scrollDirection }) => {
    // Modal functionality
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalType, setModalType] = useState<'demo' | 'repo' | null>(null);
    const [selectedCodeExample, setSelectedCodeExample] = useState<CodeExample | null>(null);
    const [codeContent, setCodeContent] = useState<CodeContent>({
        content: '',
        loading: false,
        error: null
    });

    // Refs for the scrolling rows
    const topRowRef = useRef<HTMLDivElement>(null);
    const bottomRowRef = useRef<HTMLDivElement>(null);

    // Animation speeds (pixels per second) - Ajuste aqui para controlar a velocidade
    const topRowSpeed = 20; // Reduzido de 30 para 20 (mais lento)
    const bottomRowSpeed = 25; // Reduzido de 40 para 25 (mais lento)

    // State to pause animation on hover
    const [isPaused, setIsPaused] = useState(false);

    // Store the current scroll positions persistently
    const topPositionRef = useRef(0);
    const bottomPositionRef = useRef(0);

    // Handle manual scrolling
    const scrollAmount = 300; // pixels to scroll on button click

    const scrollRow = (direction: 'left' | 'right', rowRef: React.RefObject<HTMLDivElement>, positionRef: React.MutableRefObject<number>) => {
        if (!rowRef.current) return;

        const container = rowRef.current;
        const containerWidth = container.clientWidth;
        const scrollWidth = container.scrollWidth;

        // Calculate new position
        if (direction === 'left') {
            positionRef.current = Math.max(positionRef.current - scrollAmount, 0);
        } else {
            positionRef.current = Math.min(
                positionRef.current + scrollAmount,
                scrollWidth - containerWidth
            );
        }

        // Apply the scroll
        container.scrollLeft = positionRef.current;
    };

    // Handle scrolling animation with requestAnimationFrame
    useEffect(() => {
        let lastTime = 0;
        let animationFrameId: number;

        const animate = (time: number) => {
            if (lastTime === 0) {
                lastTime = time;
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            const delta = time - lastTime;
            lastTime = time;

            if (!isPaused) {
                // Calculate pixel movement based on time delta and speed
                const topPixelMove = (topRowSpeed * delta) / 1000;
                const bottomPixelMove = (bottomRowSpeed * delta) / 1000;

                // Update positions
                if (topRowRef.current) {
                    topPositionRef.current += topPixelMove;

                    // Reset position if we've scrolled the entire width
                    const containerWidth = topRowRef.current.clientWidth;
                    const scrollWidth = topRowRef.current.scrollWidth;

                    if (topPositionRef.current >= scrollWidth - containerWidth) {
                        topPositionRef.current = 0;
                    }

                    topRowRef.current.scrollLeft = topPositionRef.current;
                }

                if (bottomRowRef.current) {
                    bottomPositionRef.current += bottomPixelMove;

                    // For bottom row, we're scrolling right to left
                    const containerWidth = bottomRowRef.current.clientWidth;
                    const scrollWidth = bottomRowRef.current.scrollWidth;

                    if (bottomPositionRef.current >= scrollWidth - containerWidth) {
                        bottomPositionRef.current = 0;
                    }

                    // Invert the scroll position for right-to-left effect
                    bottomRowRef.current.scrollLeft = scrollWidth - containerWidth - bottomPositionRef.current;
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPaused, topRowSpeed, bottomRowSpeed]);

    // Split projects into two groups for the two rows
    const topRowProjects = projects.slice(0, Math.ceil(projects.length / 2));
    const bottomRowProjects = projects.slice(Math.ceil(projects.length / 2));

    // Open project modal
    const openProjectModal = (project: Project, type: 'demo' | 'repo') => {
        setSelectedProject(project);
        setModalType(type);
        document.body.style.overflow = 'hidden';

        // Reset code content and selected example
        setCodeContent({ content: '', loading: false, error: null });
        setSelectedCodeExample(null);

        // If opening repository and project has code examples, select the first one by default
        if (type === 'repo' && project.codeExamples && project.codeExamples.length > 0) {
            const firstExample = project.codeExamples[0];
            setSelectedCodeExample(firstExample);
            fetchCodeContent(project.github!, firstExample.path);
        }
    };

    // Close project modal
    const closeProjectModal = () => {
        setSelectedProject(null);
        setModalType(null);
        document.body.style.overflow = 'auto';
        setCodeContent({ content: '', loading: false, error: null });
        setSelectedCodeExample(null);
    };

    // Fetch code content from GitHub
    const fetchCodeContent = async (repoUrl: string, filePath: string) => {
        try {
            setCodeContent({ content: '', loading: true, error: null });

            // Extract owner and repo name from GitHub URL
            const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

            // GitHub API endpoint for getting file contents
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }

            const data = await response.json();

            // GitHub API returns content as Base64 encoded
            const decodedContent = atob(data.content);

            setCodeContent({ content: decodedContent, loading: false, error: null });
        } catch (error) {
            console.error('Error fetching file content:', error);
            setCodeContent({
                content: '',
                loading: false,
                error: 'Failed to load code from GitHub. The file may not exist or access may be restricted.'
            });
        }
    };

    // Select code example
    const selectCodeExample = (example: CodeExample) => {
        setSelectedCodeExample(example);
        if (selectedProject && selectedProject.github) {
            fetchCodeContent(selectedProject.github, example.path);
        }
    };

    // Helper function to get the language from file extension
    const getLanguageFromPath = (path: string): string => {
        const extension = path.split('.').pop()?.toLowerCase() || '';
        const languageMap: Record<string, string> = {
            'py': 'python',
            'js': 'javascript',
            'jsx': 'jsx',
            'ts': 'typescript',
            'tsx': 'tsx',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'h': 'c',
            'hpp': 'cpp',
            'cs': 'csharp',
            'go': 'go',
            'rb': 'ruby',
            'php': 'php',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'sh': 'bash',
            'yml': 'yaml',
            'yaml': 'yaml',
        };

        return languageMap[extension] || 'text';
    };

    // Render a project card
    const renderProjectCard = (project: Project) => (
        <div
            key={project.id}
            className="flex-shrink-0 w-80 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md mx-3 my-3 flex flex-col"
        >
            <div className="h-52 overflow-hidden bg-gray-100 relative group">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    {project.embedUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onMouseEnter/onMouseLeave
                                openProjectModal(project, 'demo');
                            }}
                            className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
                        >
                            <ExternalLink size={16} className="mr-2" />
                            Live Demo
                        </button>
                    )}
                    {project.github && project.codeExamples && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onMouseEnter/onMouseLeave
                                openProjectModal(project, 'repo');
                            }}
                            className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
                        >
                            <Code size={16} className="mr-2" />
                            View Code
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{project.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-xs rounded"
                        >
                            {tag}
                        </span>
                    ))}
                    {project.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                            +{project.tags.length - 3}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.github && (
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 border border-gray-200 rounded text-xs flex items-center hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onMouseEnter/onMouseLeave
                            }}
                        >
                            <Github size={14} className="mr-1" />
                            GitHub
                        </a>
                    )}

                    {project.demo && (
                        <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-2 py-1 border border-gray-200 rounded text-xs flex items-center hover:bg-gray-50 transition-colors ${project.demo.includes('colab.research.google.com') ? 'bg-blue-50 border-blue-200' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onMouseEnter/onMouseLeave
                            }}
                        >
                            {project.demo.includes('colab.research.google.com') ? (
                                <>
                                    <img src="https://colab.research.google.com/img/colab_favicon_256px.png" alt="Colab" className="w-4 h-4 mr-1" />
                                    Colab
                                </>
                            ) : (
                                <>
                                    <ExternalLink size={14} className="mr-1" />
                                    Demo
                                </>
                            )}
                        </a>
                    )}

                    {project.article && (
                        <a
                            href={project.article}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 border border-gray-200 rounded text-xs flex items-center hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onMouseEnter/onMouseLeave
                            }}
                        >
                            <FileCode size={14} className="mr-1" />
                            Article
                        </a>
                    )}

                    {project.articlePt && (
                        <a
                            href={project.articlePt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 border border-gray-200 rounded text-xs flex items-center hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onMouseEnter/onMouseLeave
                            }}
                        >
                            <FileCode size={14} className="mr-1" />
                            Article (PT)
                        </a>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <section id="projects" className="py-20 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold mb-6 text-center">Projects</h2>
                <p className="text-center text-lg mb-10 max-w-2xl mx-auto">
                    Explore my projects including computer vision models, language model applications, and AI frameworks.
                </p>

                {/* Controles para ajustar a velocidade do carrossel */}
                <div className="flex justify-center mb-6 gap-4">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                        {isPaused ? 'Start Carousel' : 'Pause Carousel'}
                    </button>
                </div>

                {/* Top row - scrolls left to right */}
                <div className="overflow-hidden mb-6 relative group">
                    {/* Left navigation button */}
                    <button
                        onClick={() => scrollRow('left', topRowRef, topPositionRef)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        ref={topRowRef}
                        className="flex whitespace-nowrap overflow-x-scroll scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Double the projects to create a seamless loop */}
                        {[...topRowProjects, ...topRowProjects].map((project, index) => (
                            <div key={`${project.id}-${index}`} className="inline-block">
                                {renderProjectCard(project)}
                            </div>
                        ))}
                    </div>

                    {/* Right navigation button */}
                    <button
                        onClick={() => scrollRow('right', topRowRef, topPositionRef)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Bottom row - scrolls right to left */}
                <div className="overflow-hidden relative group">
                    {/* Left navigation button */}
                    <button
                        onClick={() => scrollRow('left', bottomRowRef, bottomPositionRef)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        ref={bottomRowRef}
                        className="flex whitespace-nowrap overflow-x-scroll scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Double the projects to create a seamless loop */}
                        {[...bottomRowProjects, ...bottomRowProjects].map((project, index) => (
                            <div key={`${project.id}-${index}`} className="inline-block">
                                {renderProjectCard(project)}
                            </div>
                        ))}
                    </div>

                    {/* Right navigation button */}
                    <button
                        onClick={() => scrollRow('right', bottomRowRef, bottomPositionRef)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Project Modal for Demo or Code */}
            {selectedProject && modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold">{selectedProject.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {modalType === 'demo' ? 'Live Demo' : 'Project Code & Details'}
                                </p>
                            </div>
                            <button
                                onClick={closeProjectModal}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            {modalType === 'demo' && selectedProject.embedUrl && (
                                <iframe
                                    src={selectedProject.embedUrl}
                                    className="w-full h-full min-h-[600px]"
                                    title={`${selectedProject.title} Demo`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}

                            {modalType === 'repo' && (
                                <div className="flex flex-1 overflow-hidden">
                                    {/* File Selector Sidebar */}
                                    <div className="w-64 border-r bg-gray-50 overflow-y-auto">
                                        <div className="p-4 border-b">
                                            <div className="flex items-center">
                                                <Github size={16} className="mr-2" />
                                                <a
                                                    href={selectedProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-mono text-blue-600 hover:underline truncate"
                                                >
                                                    {selectedProject.github?.replace('https://github.com/', '')}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <h4 className="px-2 py-1 text-sm font-medium text-gray-500">Some Project Files</h4>
                                            <ul className="mt-2">
                                                {selectedProject.codeExamples?.map((example: CodeExample, index: number) => (
                                                    <li key={index}>
                                                        <button
                                                            onClick={() => selectCodeExample(example)}
                                                            className={`w-full flex items-start p-2 rounded text-left text-sm transition-colors ${selectedCodeExample && selectedCodeExample.path === example.path
                                                                ? 'bg-gray-200'
                                                                : 'hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <FileCode size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">{example.path.split('/').pop()}</div>
                                                                <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Code Content */}
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        {selectedCodeExample && (
                                            <div className="p-2 border-b flex items-center justify-between bg-gray-50">
                                                <div className="flex items-center">
                                                    <FileCode size={16} className="mr-2 text-gray-500" />
                                                    <span className="font-mono text-sm">{selectedCodeExample.path}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (codeContent.content) {
                                                                navigator.clipboard.writeText(codeContent.content);
                                                            }
                                                        }}
                                                        className="flex items-center p-1 px-2 rounded text-xs bg-gray-200 hover:bg-gray-300 transition-colors"
                                                        disabled={!codeContent.content || codeContent.loading}
                                                    >
                                                        <Download size={14} className="mr-1" />
                                                        Copy Code
                                                    </button>
                                                    <a
                                                        href={`${selectedProject.github}/blob/main/${selectedCodeExample.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center p-1 px-2 rounded text-xs bg-gray-200 hover:bg-gray-300 transition-colors"
                                                    >
                                                        <ExternalLink size={14} className="mr-1" />
                                                        View on GitHub
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 overflow-auto">
                                            {codeContent.loading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                                                    <Loader2 size={30} className="animate-spin text-gray-400" />
                                                </div>
                                            )}

                                            {codeContent.error && (
                                                <div className="p-4 flex flex-col items-center justify-center h-full">
                                                    <AlertTriangle size={30} className="text-amber-500 mb-3" />
                                                    <p className="text-red-500 text-center mb-3">{codeContent.error}</p>
                                                    <a
                                                        href={selectedProject.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors"
                                                    >
                                                        View Repository
                                                    </a>
                                                </div>
                                            )}

                                            {!codeContent.loading && !codeContent.error && codeContent.content && selectedCodeExample && (
                                                <div className="h-full overflow-auto">
                                                    <SyntaxHighlighter
                                                        language={selectedCodeExample.language || getLanguageFromPath(selectedCodeExample.path)}
                                                        style={tomorrow}
                                                        showLineNumbers={true}
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '16px',
                                                            fontSize: '14px',
                                                            height: 'auto',
                                                            minHeight: '100%'
                                                        }}
                                                    >
                                                        {codeContent.content}
                                                    </SyntaxHighlighter>
                                                </div>
                                            )}

                                            {!codeContent.loading && !codeContent.error && !codeContent.content && (
                                                <div className="flex items-center justify-center h-full p-6 text-gray-500">
                                                    Select a file to view the code
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Project Details Section */}
                        {modalType === 'repo' && (
                            <div className="border-t p-4 max-h-64 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Description</h4>
                                        <p className="text-sm text-gray-700">{selectedProject.description}</p>

                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2">Technologies</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.tags.map((tag: string) => (
                                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-sm rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Links</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedProject.github && (
                                                <a
                                                    href={selectedProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center"
                                                >
                                                    <Github size={18} className="mr-2" />
                                                    GitHub Repository
                                                </a>
                                            )}

                                            {selectedProject.demo && (
                                                <a
                                                    href={selectedProject.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center ${selectedProject.demo.includes('colab.research.google.com') ? 'bg-blue-50 border-blue-200' : ''}`}
                                                >
                                                    {selectedProject.demo.includes('colab.research.google.com') ? (
                                                        <>
                                                            <img src="https://colab.research.google.com/img/colab_favicon_256px.png" alt="Colab" className="w-5 h-5 mr-2" />
                                                            Google Colab
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ExternalLink size={18} className="mr-2" />
                                                            Live Demo
                                                        </>
                                                    )}
                                                </a>
                                            )}

                                            {selectedProject.article && (
                                                <a
                                                    href={selectedProject.article}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                                                >
                                                    <FileCode size={18} className="mr-2" />
                                                    Article
                                                </a>
                                            )}

                                            {selectedProject.articlePt && (
                                                <a
                                                    href={selectedProject.articlePt}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                                                >
                                                    <FileCode size={18} className="mr-2" />
                                                    Article (PT)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProjectsCarousel; 