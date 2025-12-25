import React, { useState, useRef, useEffect } from 'react';
import { Github, ExternalLink, FileCode, Code, X, Loader2, AlertTriangle, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Project, CodeExample, SectionProps } from '../lib/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { useMultipleGithubStars } from '../hooks/useGithubStars';

interface ProjectsCarouselProps extends SectionProps {
    projects: Project[];
}

interface CodeContent {
    content: string;
    loading: boolean;
    error: string | null;
}

const ProjectsCarousel: React.FC<ProjectsCarouselProps> = ({ projects, scrollDirection }) => {
    // Fetch GitHub stars for all projects
    const repoUrls = projects.map(p => p.github).filter(Boolean) as string[];
    const starsMap = useMultipleGithubStars(repoUrls);

    // Modal functionality
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalType, setModalType] = useState<'demo' | 'repo' | 'article' | 'pdf' | null>(null);
    const [selectedCodeExample, setSelectedCodeExample] = useState<CodeExample | null>(null);
    const [codeContent, setCodeContent] = useState<CodeContent>({
        content: '',
        loading: false,
        error: null
    });
    const [articleContent, setArticleContent] = useState<string>('');
    const [articleLoading, setArticleLoading] = useState<boolean>(false);
    const [articleError, setArticleError] = useState<string | null>(null);

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
    const openProjectModal = (project: Project, type: 'demo' | 'repo' | 'article' | 'pdf') => {
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

        // If opening article for peft-methods project, fetch the markdown content
        if (type === 'article' && project.id === 'peft-methods') {
            fetchArticleContent();
        }
    };

    // Fetch article content from local markdown file
    const fetchArticleContent = async () => {
        try {
            setArticleLoading(true);
            setArticleError(null);

            const response = await fetch('/article/peft-methods.md');

            if (!response.ok) {
                throw new Error(`Failed to fetch article: ${response.status}`);
            }

            const content = await response.text();
            setArticleContent(content);
            setArticleLoading(false);
        } catch (error) {
            console.error('Error fetching article content:', error);
            setArticleError('Failed to load article content. Please try again later.');
            setArticleLoading(false);
        }
    };

    // Close project modal
    const closeProjectModal = () => {
        setSelectedProject(null);
        setModalType(null);
        document.body.style.overflow = 'auto';
        setCodeContent({ content: '', loading: false, error: null });
        setSelectedCodeExample(null);
        setArticleContent('');
        setArticleError(null);
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
            className="flex-shrink-0 w-80 bg-dark-tertiary rounded-lg overflow-hidden border border-dark-border shadow-sm transition-all hover:shadow-md hover:border-dark-accent/50 hover:scale-[1.02] mx-3 my-3 flex flex-col cursor-pointer"
            onClick={() => {
                // For PEFT Methods project, open article view if available
                if (project.id === "peft-methods" && project.article) {
                    openProjectModal(project, 'article');
                } else if (project.pdfUrl) {
                    // For projects with PDF articles
                    openProjectModal(project, 'pdf');
                } else if (project.embedUrl) {
                    // For other projects with embedUrl, open demo view
                    openProjectModal(project, 'demo');
                } else if (project.github && project.codeExamples) {
                    // Otherwise, open repo view if available
                    openProjectModal(project, 'repo');
                }
            }}
        >
            <div className="h-52 overflow-hidden bg-dark-secondary relative group">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {project.languagePt && (
                    <div className="absolute top-2 right-2 bg-dark-tertiary text-dark-text-secondary px-2 py-1 text-xs rounded-md border border-dark-border">
                        🇧🇷 PT-BR
                    </div>
                )}
                {project.github && starsMap.get(project.github) !== undefined && starsMap.get(project.github)! > 0 && (
                    <div className="absolute bottom-2 right-2 bg-dark-tertiary/90 backdrop-blur-sm text-dark-text-primary px-2 py-1 text-xs rounded-md border border-dark-border flex items-center gap-1 z-10">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{starsMap.get(project.github)}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-dark-primary bg-opacity-80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    {project.embedUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                                openProjectModal(project, 'demo');
                            }}
                            className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                        >
                            <ExternalLink size={16} className="mr-2" />
                            Live Demo
                        </button>
                    )}
                    {project.github && project.codeExamples && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                                openProjectModal(project, 'repo');
                            }}
                            className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                        >
                            <Code size={16} className="mr-2" />
                            View Code
                        </button>
                    )}
                    {project.pdfUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                                openProjectModal(project, 'pdf');
                            }}
                            className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                        >
                            <FileCode size={16} className="mr-2" />
                            View Article
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-dark-text-primary">{project.title}</h3>
                <p className="text-dark-text-secondary text-sm mb-4 line-clamp-3 flex-1">{project.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-dark-secondary text-dark-text-secondary text-xs rounded"
                        >
                            {tag}
                        </span>
                    ))}
                    {project.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-dark-secondary text-dark-text-secondary text-xs rounded">
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
                            className="px-2 py-1 border border-dark-border rounded text-xs flex items-center hover:bg-dark-secondary transition-colors text-dark-text-secondary"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
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
                            className={`px-2 py-1 border border-dark-border rounded text-xs flex items-center hover:bg-dark-secondary transition-colors text-dark-text-secondary ${project.demo.includes('colab.research.google.com') ? 'bg-dark-secondary border-dark-accent/50' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
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
                            className="px-2 py-1 border border-dark-border rounded text-xs flex items-center hover:bg-dark-secondary transition-colors text-dark-text-secondary"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                                if (project.id === "peft-methods") {
                                    e.preventDefault();
                                    openProjectModal(project, 'article');
                                }
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
                            className="px-2 py-1 border border-dark-border rounded text-xs flex items-center hover:bg-dark-secondary transition-colors text-dark-text-secondary"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                            }}
                        >
                            <FileCode size={14} className="mr-1" />
                            Article (PT)
                        </a>
                    )}

                    {project.pdfUrl && (
                        <a
                            href={project.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 border border-dark-border rounded text-xs flex items-center hover:bg-dark-secondary transition-colors text-dark-text-secondary"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                                e.preventDefault();
                                openProjectModal(project, 'pdf');
                            }}
                        >
                            <FileCode size={14} className="mr-1" />
                            PDF Article
                        </a>
                    )}

                    {project.externalUrl && (
                        <a
                            href={project.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 border border-dark-border rounded text-xs flex items-center hover:bg-dark-secondary transition-colors text-dark-text-secondary"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent's onClick
                            }}
                        >
                            <ExternalLink size={14} className="mr-1" />
                            Site
                        </a>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <section id="projects" className="py-20 bg-dark-primary overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold mb-6 text-center text-dark-text-primary">Projects</h2>
                <p className="text-center text-lg mb-10 max-w-2xl mx-auto text-dark-text-secondary">
                    Explore my projects including computer vision models, language model applications, and AI frameworks.
                </p>

                {/* Controles para ajustar a velocidade do carrossel */}
                <div className="flex justify-center mb-6 gap-4">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="px-4 py-2 bg-dark-tertiary border border-dark-border rounded-md hover:bg-dark-secondary transition-colors text-sm text-dark-text-secondary"
                    >
                        {isPaused ? 'Start Carousel' : 'Pause Carousel'}
                    </button>
                </div>

                {/* Top row - scrolls left to right */}
                <div className="overflow-hidden mb-6 relative group">
                    {/* Left navigation button */}
                    <button
                        onClick={() => scrollRow('left', topRowRef, topPositionRef)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-dark-tertiary bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity text-dark-text-primary"
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-dark-tertiary bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity text-dark-text-primary"
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
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-dark-tertiary bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity text-dark-text-primary"
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-dark-tertiary bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity text-dark-text-primary"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Project Modal for Demo or Code */}
            {selectedProject && modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-secondary rounded-lg w-full max-w-6xl h-[90vh] flex flex-col border border-dark-border">
                        <div className="flex justify-between items-center p-4 border-b border-dark-border">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-dark-text-primary">{selectedProject.title}</h3>
                                <p className="text-sm text-dark-text-secondary">
                                    {modalType === 'demo' ? 'Live Demo' :
                                        modalType === 'article' ? 'Article' :
                                            modalType === 'pdf' ? 'PDF Article' :
                                                'Project Code & Details'}
                                </p>
                            </div>
                            <button
                                onClick={closeProjectModal}
                                className="p-1 rounded-full hover:bg-dark-tertiary text-dark-text-secondary"
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

                            {modalType === 'pdf' && selectedProject.pdfUrl && (
                                <div className="w-full h-full overflow-auto bg-dark-primary">
                                    <div className="max-w-4xl mx-auto p-8">
                                        <div className="flex justify-center gap-4 mb-8">
                                            <a
                                                href={selectedProject.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                                            >
                                                <Download size={16} className="mr-2" />
                                                Open in New Tab
                                            </a>

                                            {selectedProject.externalUrl && (
                                                <a
                                                    href={selectedProject.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                                                >
                                                    <ExternalLink size={16} className="mr-2" />
                                                    View on AINews
                                                </a>
                                            )}
                                        </div>

                                        <div className="bg-dark-secondary p-4 rounded-lg border border-dark-border shadow-md">
                                            <iframe
                                                src={selectedProject.pdfUrl}
                                                className="w-full h-[70vh]"
                                                title={`${selectedProject.title} PDF`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalType === 'article' && selectedProject.id === 'peft-methods' && (
                                <div className="w-full h-full overflow-auto bg-dark-primary">
                                    <div className="max-w-4xl mx-auto p-8">
                                        <div className="flex justify-center gap-4 mb-8">
                                            <a
                                                href={selectedProject.article}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                                            >
                                                <ExternalLink size={16} className="mr-2" />
                                                View on Hugging Face
                                            </a>

                                            {selectedProject.demo && (
                                                <a
                                                    href={selectedProject.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                                                >
                                                    <img src="https://colab.research.google.com/img/colab_favicon_256px.png" alt="Colab" className="w-5 h-5 mr-2" />
                                                    Open in Colab
                                                </a>
                                            )}
                                        </div>

                                        {articleLoading && (
                                            <div className="flex items-center justify-center p-12">
                                                <Loader2 size={40} className="animate-spin text-dark-text-secondary" />
                                            </div>
                                        )}

                                        {articleError && (
                                            <div className="p-8 flex flex-col items-center justify-center">
                                                <AlertTriangle size={40} className="text-amber-500 mb-4" />
                                                <p className="text-red-400 text-center">{articleError}</p>
                                            </div>
                                        )}

                                        {!articleLoading && !articleError && articleContent && (
                                            <article className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none bg-dark-secondary p-8 rounded-lg shadow-md border border-dark-border">
                                                <div className="prose-headings:text-dark-text-primary prose-headings:border-b prose-headings:border-dark-border/30 prose-headings:pb-2 prose-h1:text-3xl prose-h1:font-bold prose-h1:border-none prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-p:text-dark-text-secondary prose-a:text-dark-accent prose-a:no-underline hover:prose-a:text-dark-accent/70 hover:prose-a:underline prose-code:text-dark-accent prose-code:bg-dark-primary/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-dark-primary prose-pre:border prose-pre:border-dark-border prose-pre:rounded-lg prose-img:rounded-lg prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain prose-table:border-collapse prose-th:bg-dark-primary prose-th:border prose-th:border-dark-border prose-th:p-2 prose-td:border prose-td:border-dark-border prose-td:p-2 prose-blockquote:border-l-4 prose-blockquote:border-dark-accent/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-dark-text-secondary/70">
                                                    <ReactMarkdown
                                                        components={{
                                                            code({ className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                return match ? (
                                                                    <SyntaxHighlighter
                                                                        style={tomorrow as any}
                                                                        language={match[1]}
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </SyntaxHighlighter>
                                                                ) : (
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            },
                                                            img({ src, alt, ...props }: any) {
                                                                // Ensure images are properly displayed
                                                                return (
                                                                    <img
                                                                        src={src}
                                                                        alt={alt || ''}
                                                                        className="max-w-full rounded-lg my-6"
                                                                        {...props}
                                                                    />
                                                                );
                                                            },
                                                            a({ node, children, href, ...props }: any) {
                                                                // Handle links
                                                                return (
                                                                    <a
                                                                        href={href}
                                                                        target={href?.startsWith('http') ? '_blank' : undefined}
                                                                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                                        {...props}
                                                                    >
                                                                        {children}
                                                                    </a>
                                                                );
                                                            },
                                                            table({ children }: any) {
                                                                return (
                                                                    <div className="overflow-x-auto my-6">
                                                                        <table>{children}</table>
                                                                    </div>
                                                                );
                                                            }
                                                        }}
                                                        rehypePlugins={[
                                                            rehypeRaw, // Allow HTML in markdown
                                                            rehypeSlug, // Add ids to headings
                                                            [rehypeAutolinkHeadings, { behavior: 'wrap' }] // Make headings clickable
                                                        ]}
                                                    >
                                                        {articleContent}
                                                    </ReactMarkdown>
                                                </div>
                                            </article>
                                        )}
                                    </div>
                                </div>
                            )}

                            {modalType === 'article' && selectedProject.id !== 'peft-methods' && selectedProject.article && (
                                <div className="w-full h-full p-4 overflow-auto bg-dark-primary">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="flex justify-center mb-8">
                                            <a
                                                href={selectedProject.article}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-dark-tertiary text-dark-text-primary rounded-md font-medium hover:bg-dark-secondary transition-colors flex items-center"
                                            >
                                                <ExternalLink size={16} className="mr-2" />
                                                Open Article in New Tab
                                            </a>
                                        </div>
                                        <iframe
                                            src={selectedProject.article}
                                            className="w-full min-h-[70vh] border border-dark-border rounded-lg"
                                            title={`${selectedProject.title} Article`}
                                        />
                                    </div>
                                </div>
                            )}

                            {modalType === 'repo' && (
                                <div className="flex flex-1 overflow-hidden">
                                    {/* File Selector Sidebar */}
                                    <div className="w-64 border-r border-dark-border bg-dark-primary overflow-y-auto">
                                        <div className="p-4 border-b border-dark-border">
                                            <div className="flex items-center">
                                                <Github size={16} className="mr-2 text-dark-text-secondary" />
                                                <a
                                                    href={selectedProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-mono text-dark-accent hover:underline truncate"
                                                >
                                                    {selectedProject.github?.replace('https://github.com/', '')}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <h4 className="px-2 py-1 text-sm font-medium text-dark-text-secondary">Some Project Files</h4>
                                            <ul className="mt-2">
                                                {selectedProject.codeExamples?.map((example: CodeExample, index: number) => (
                                                    <li key={index}>
                                                        <button
                                                            onClick={() => selectCodeExample(example)}
                                                            className={`w-full flex items-start p-2 rounded text-left text-sm transition-colors ${selectedCodeExample && selectedCodeExample.path === example.path
                                                                ? 'bg-dark-tertiary text-dark-text-primary'
                                                                : 'text-dark-text-secondary hover:bg-dark-tertiary/50 hover:text-dark-text-primary'
                                                                }`}
                                                        >
                                                            <FileCode size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">{example.path.split('/').pop()}</div>
                                                                <div className="text-xs text-dark-text-secondary/70 mt-1">{example.description}</div>
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
                                            <div className="p-2 border-b border-dark-border flex items-center justify-between bg-dark-primary">
                                                <div className="flex items-center">
                                                    <FileCode size={16} className="mr-2 text-dark-text-secondary" />
                                                    <span className="font-mono text-sm text-dark-text-secondary">{selectedCodeExample.path}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (codeContent.content) {
                                                                navigator.clipboard.writeText(codeContent.content);
                                                            }
                                                        }}
                                                        className="flex items-center p-1 px-2 rounded text-xs bg-dark-tertiary hover:bg-dark-tertiary/70 transition-colors text-dark-text-secondary"
                                                        disabled={!codeContent.content || codeContent.loading}
                                                    >
                                                        <Download size={14} className="mr-1" />
                                                        Copy Code
                                                    </button>
                                                    <a
                                                        href={`${selectedProject.github}/blob/main/${selectedCodeExample.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center p-1 px-2 rounded text-xs bg-dark-tertiary hover:bg-dark-tertiary/70 transition-colors text-dark-text-secondary"
                                                    >
                                                        <ExternalLink size={14} className="mr-1" />
                                                        View on GitHub
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 overflow-auto bg-dark-primary">
                                            {codeContent.loading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-dark-primary bg-opacity-70 z-10">
                                                    <Loader2 size={30} className="animate-spin text-dark-text-secondary" />
                                                </div>
                                            )}

                                            {codeContent.error && (
                                                <div className="p-4 flex flex-col items-center justify-center h-full">
                                                    <AlertTriangle size={30} className="text-amber-500 mb-3" />
                                                    <p className="text-red-400 text-center mb-3">{codeContent.error}</p>
                                                    <a
                                                        href={selectedProject.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-dark-tertiary rounded-md text-sm hover:bg-dark-tertiary/70 transition-colors text-dark-text-secondary"
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
                                                            minHeight: '100%',
                                                            background: '#0c0f19',
                                                        }}
                                                    >
                                                        {codeContent.content}
                                                    </SyntaxHighlighter>
                                                </div>
                                            )}

                                            {!codeContent.loading && !codeContent.error && !codeContent.content && (
                                                <div className="flex items-center justify-center h-full p-6 text-dark-text-secondary">
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
                            <div className="border-t border-dark-border p-4 max-h-64 overflow-y-auto bg-dark-secondary">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2 text-dark-text-primary">Description</h4>
                                        <p className="text-sm text-dark-text-secondary">{selectedProject.description}</p>

                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2 text-dark-text-primary">Technologies</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.tags.map((tag: string) => (
                                                    <span key={tag} className="px-2 py-1 bg-dark-tertiary text-dark-text-secondary text-sm rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2 text-dark-text-primary">Links</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedProject.github && (
                                                <a
                                                    href={selectedProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-dark-primary text-dark-text-primary rounded-md hover:bg-dark-primary/70 transition-colors flex items-center border border-dark-border"
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
                                                    className={`px-4 py-2 border border-dark-border rounded-md hover:bg-dark-tertiary/50 transition-colors flex items-center text-dark-text-secondary ${selectedProject.demo.includes('colab.research.google.com') ? 'bg-dark-primary/50' : ''}`}
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
                                                    className="px-4 py-2 border border-dark-border rounded-md hover:bg-dark-tertiary/50 transition-colors flex items-center text-dark-text-secondary"
                                                    onClick={(e) => {
                                                        if (selectedProject.id === "peft-methods") {
                                                            e.preventDefault();
                                                            openProjectModal(selectedProject, 'article');
                                                        }
                                                    }}
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
                                                    className="px-4 py-2 border border-dark-border rounded-md hover:bg-dark-tertiary/50 transition-colors flex items-center text-dark-text-secondary"
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