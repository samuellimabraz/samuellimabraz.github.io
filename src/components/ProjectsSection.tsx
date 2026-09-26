import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Github, ExternalLink, FileCode, X, Loader2, AlertTriangle, Star } from 'lucide-react';
import { Project, ProjectArea, CodeExample } from '../lib/types';
import { Download } from 'lucide-react';
import { useMultipleGithubStars } from '../hooks/useGithubStars';
import { parseGitHubRepoUrl, safeLocalStorageGet, safeLocalStorageSet } from '../lib/github';

const CodeBlock = lazy(() => import('./CodeBlock'));
const MarkdownArticle = lazy(() => import('./MarkdownArticle'));

interface ProjectsSectionProps {
    projects: Project[];
}

const AREAS: { id: ProjectArea; label: string; hint: string; dot: string; ring: string }[] = [
    { id: 'vision', label: 'Computer Vision', hint: 'Detection, segmentation, pose, and classical image processing on camera and document images.', dot: 'bg-emerald-600', ring: 'ring-emerald-600' },
    { id: 'robotics', label: 'Robotics & Control', hint: 'Flight stacks, controllers, actuators, and mission state machines that move real vehicles and arms.', dot: 'bg-blue-600', ring: 'ring-blue-600' },
    { id: 'localization', label: 'Localization & Depth', hint: 'Visual SLAM and odometry, depth and range sensing, GPS, and camera-to-world geometry.', dot: 'bg-orange-500', ring: 'ring-orange-500' },
    { id: 'edge', label: 'Edge Deployment', hint: 'Models exported, optimized, or run on-device: ONNX, TensorRT, OpenVINO, Triton, Jetson, microcontrollers.', dot: 'bg-rose-600', ring: 'ring-rose-600' },
    { id: 'training', label: 'Training & Data', hint: 'Datasets, synthetic data, augmentation, training and fine-tuning, hyperparameter search, and benchmarks.', dot: 'bg-amber-500', ring: 'ring-amber-500' },
    { id: 'llm', label: 'LLMs & Multimodal', hint: 'Language and vision-language models, document transformers, OCR, and RAG agents.', dot: 'bg-violet-600', ring: 'ring-violet-600' },
    { id: 'embedded', label: 'Embedded Hardware', hint: 'Microcontroller firmware and drivers for sensors and actuators.', dot: 'bg-cyan-500', ring: 'ring-cyan-500' },
    { id: 'software', label: 'Software & CS', hint: 'SDKs, libraries, backend APIs, compilers, and algorithms.', dot: 'bg-slate-500', ring: 'ring-slate-500' },
];

const areaOf = (id: ProjectArea) => AREAS.find(a => a.id === id)!;

const spinner = (
    <div className="flex items-center justify-center p-12">
        <Loader2 size={30} className="animate-spin text-light-text-secondary" />
    </div>
);

interface CodeContent {
    content: string;
    loading: boolean;
    error: string | null;
    branch?: string;
    htmlUrl?: string;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
    // Fetch GitHub stars for all projects
    const repoUrls = projects.map(p => p.github).filter(Boolean) as string[];
    const starsMap = useMultipleGithubStars(repoUrls);

    // Modal functionality
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalType, setModalType] = useState<'demo' | 'repo' | 'article' | 'pdf' | 'info' | null>(null);
    const [selectedCodeExample, setSelectedCodeExample] = useState<CodeExample | null>(null);
    const [codeContent, setCodeContent] = useState<CodeContent>({
        content: '',
        loading: false,
        error: null
    });
    const [articleContent, setArticleContent] = useState<string>('');
    const [articleLoading, setArticleLoading] = useState<boolean>(false);
    const [articleError, setArticleError] = useState<string | null>(null);

    const [activeArea, setActiveArea] = useState<ProjectArea | null>(null);
    // Ids under the 3x3 "kernel" around the tile the mouse is over.
    const [kernelIds, setKernelIds] = useState<Set<string>>(new Set());
    const gridRef = useRef<HTMLDivElement>(null);

    const moveKernel = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== 'mouse' || !gridRef.current) return;
        const center = e.currentTarget.getBoundingClientRect();
        const ids = new Set<string>();
        for (const tile of Array.from(gridRef.current.children) as HTMLElement[]) {
            const r = tile.getBoundingClientRect();
            if (r.width === 0) continue;
            if (Math.abs(r.left - center.left) < center.width * 1.5 && Math.abs(r.top - center.top) < center.height * 1.5) {
                ids.add(tile.dataset.id!);
            }
        }
        setKernelIds(ids);
    };

    const isDirectPdf = (url: string) => url.split('?')[0].toLowerCase().endsWith('.pdf');

    const articleLinkLabel = (project: Project) => project.articleLabel ?? 'Post';

    const determineModalType = (project: Project): 'demo' | 'repo' | 'article' | 'pdf' | 'info' => {
        if (project.id === 'peft-methods' && project.article) {
            return 'article';
        }
        if (project.github && project.codeExamples) {
            return 'repo';
        }
        if (project.embedUrl) {
            return 'demo';
        }
        return 'info';
    };

    // Open project modal
    const openProjectModal = (project: Project, type: 'demo' | 'repo' | 'article' | 'pdf' | 'info') => {
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
        // Clear #projects/<id> so opening the same project again fires hashchange.
        if (window.location.hash.startsWith('#projects/')) {
            window.history.replaceState(null, '', '#projects');
        }
    };

    useEffect(() => {
        if (!selectedProject) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeProjectModal();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedProject]);

    // Handle hash-based project opening (e.g., #projects/signature-detection)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            
            // Check if hash matches projects/{project-id} pattern
            if (hash.startsWith('projects/')) {
                const projectId = hash.replace('projects/', '');
                const project = projects.find(p => p.id === projectId);
                
                if (project) {
                    // Navigate to projects section first
                    const projectsSection = document.getElementById('projects');
                    if (projectsSection) {
                        window.scrollTo({
                            top: projectsSection.offsetTop - 70,
                            behavior: 'smooth'
                        });
                    }
                    
                    setTimeout(() => {
                        openProjectModal(project, determineModalType(project));
                    }, 500);
                }
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects]);

    // Fetch code content from GitHub
    const fetchCodeContent = async (repoUrl: string, filePath: string) => {
        try {
            setCodeContent({ content: '', loading: true, error: null });

            const ref = parseGitHubRepoUrl(repoUrl);
            if (!ref) {
                throw new Error('Invalid GitHub repository URL');
            }

            const { owner, repo } = ref;
            const cacheKey = `gh_code_cache_v1:${owner}/${repo}:${filePath}`;
            const cachedRaw = safeLocalStorageGet(cacheKey);
            if (cachedRaw) {
                try {
                    const cached = JSON.parse(cachedRaw) as { content?: unknown; timestamp?: unknown; branch?: unknown; htmlUrl?: unknown };
                    if (typeof cached.content === 'string' && typeof cached.timestamp === 'number') {
                        // 24h cache for code examples
                        if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
                            setCodeContent({
                                content: cached.content,
                                loading: false,
                                error: null,
                                branch: typeof cached.branch === 'string' ? cached.branch : undefined,
                                htmlUrl: typeof cached.htmlUrl === 'string' ? cached.htmlUrl : undefined
                            });
                            return;
                        }
                    }
                } catch {
                    // ignore invalid cache
                }
            }

            const tryRaw = async (branch: string) => {
                const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
                const resp = await fetch(rawUrl, { headers: { Accept: 'text/plain' } });
                if (!resp.ok) return null;
                const text = await resp.text();
                return { content: text, branch, htmlUrl: `${repoUrl}/blob/${branch}/${filePath}` };
            };

            // Prefer raw.githubusercontent.com (no API rate limit for typical use)
            const rawResult = (await tryRaw('main')) ?? (await tryRaw('master'));
            if (rawResult) {
                safeLocalStorageSet(cacheKey, JSON.stringify({ ...rawResult, timestamp: Date.now() }));
                setCodeContent({ content: rawResult.content, loading: false, error: null, branch: rawResult.branch, htmlUrl: rawResult.htmlUrl });
                return;
            }

            // Fallback to GitHub API (can be rate-limited; also limited to 1MB base64)
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
            const response = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } });
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }

            const data = await response.json();

            // If available, prefer download_url (raw) since content may be missing/truncated for large files
            if (typeof data?.download_url === 'string') {
                const dlResp = await fetch(data.download_url, { headers: { Accept: 'text/plain' } });
                if (!dlResp.ok) throw new Error(`Failed to download file: ${dlResp.status}`);
                const text = await dlResp.text();
                const htmlUrl = typeof data?.html_url === 'string' ? data.html_url : `${repoUrl}`;
                safeLocalStorageSet(cacheKey, JSON.stringify({ content: text, timestamp: Date.now(), htmlUrl }));
                setCodeContent({ content: text, loading: false, error: null, htmlUrl });
                return;
            }

            if (typeof data?.content === 'string' && (data?.encoding === 'base64' || typeof data?.encoding === 'string')) {
                const decodedContent = atob(String(data.content).replace(/\n/g, ''));
                const htmlUrl = typeof data?.html_url === 'string' ? data.html_url : `${repoUrl}`;
                safeLocalStorageSet(cacheKey, JSON.stringify({ content: decodedContent, timestamp: Date.now(), htmlUrl }));
                setCodeContent({ content: decodedContent, loading: false, error: null, htmlUrl });
                return;
            }

            throw new Error('Unsupported GitHub API response');
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
            'ino': 'cpp',
        };

        return languageMap[extension] || 'text';
    };

    const clickLabel = (project: Project) => {
        const type = determineModalType(project);
        if (type === 'demo') return 'Open demo';
        if (type === 'article') return 'Read article';
        if (type === 'repo') return 'View code';
        return 'View project';
    };

    const renderProjectTile = (project: Project) => {
        const stars = project.github ? starsMap.get(project.github) : undefined;
        const dimmed = activeArea !== null && !project.areas.includes(activeArea);
        const lit = activeArea !== null && !dimmed;
        const ring = lit && activeArea ? areaOf(activeArea).ring : '';
        const badge = 'px-1.5 py-0.5 border border-light-border text-[11px] leading-none flex items-center text-light-text-secondary hover:bg-light-secondary';
        const open = () => openProjectModal(project, determineModalType(project));
        return (
            <div
                key={project.id}
                role="button"
                tabIndex={0}
                data-id={project.id}
                onClick={open}
                onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open();
                    }
                }}
                onPointerEnter={moveKernel}
                className={`group text-left bg-light-primary border border-light-border flex flex-col overflow-hidden transition-[opacity,filter,box-shadow] duration-300 hover:border-light-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-accent cursor-pointer ${dimmed ? 'opacity-30 grayscale max-sm:hidden' : ''} ${ring ? `ring-2 ${ring}` : ''} ${kernelIds.has(project.id) && !lit ? 'ring-1 ring-light-text-secondary/40' : ''}`}
            >
                <div className="relative aspect-[16/10] overflow-hidden bg-light-secondary">
                    <img
                        src={project.image}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        width={320}
                        height={200}
                        loading="lazy"
                        decoding="async"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white text-sm font-medium border border-white/80 px-3 py-1.5">{clickLabel(project)}</span>
                    </div>
                    {project.languagePt && (
                        <span className="absolute top-2 right-2 bg-light-primary text-light-text-secondary px-1.5 py-0.5 text-[10px] border border-light-border">
                            🇧🇷 PT-BR
                        </span>
                    )}
                    {stars !== undefined && stars > 0 && (
                        <span className="absolute bottom-2 right-2 bg-light-primary/90 text-light-text-primary px-1.5 py-0.5 text-xs border border-light-border flex items-center gap-1">
                            <Star size={11} className="text-yellow-400 fill-yellow-400" />
                            {stars}
                        </span>
                    )}
                </div>
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <h3 className="text-sm font-semibold leading-snug text-light-text-primary line-clamp-2">{project.title}</h3>
                    <p className="text-xs leading-snug text-light-text-secondary line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className={badge} onClick={(e) => e.stopPropagation()}>
                                <Github size={12} className="mr-1" />
                                GitHub
                            </a>
                        )}
                        {project.demo && (
                            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={badge} onClick={(e) => e.stopPropagation()}>
                                <ExternalLink size={12} className="mr-1" />
                                {project.demo.includes('colab.research.google.com') ? 'Colab' : 'Demo'}
                            </a>
                        )}
                        {project.article && (
                            <a
                                href={project.article}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={badge}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (project.id === 'peft-methods') {
                                        e.preventDefault();
                                        openProjectModal(project, 'article');
                                    }
                                }}
                            >
                                <FileCode size={12} className="mr-1" />
                                {articleLinkLabel(project)}
                            </a>
                        )}
                        {project.pdfUrl && (
                            <a
                                href={project.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={badge}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDirectPdf(project.pdfUrl!)) {
                                        e.preventDefault();
                                        openProjectModal(project, 'pdf');
                                    }
                                }}
                            >
                                <FileCode size={12} className="mr-1" />
                                PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="projects" className="py-20 bg-light-secondary overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold mb-8 text-center text-light-text-primary">Projects</h2>

                <div
                    className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center"
                    style={{ scrollbarWidth: 'none' }}
                    role="group"
                    aria-label="Filter projects by area"
                >
                    {[null, ...AREAS].map((a) => {
                        const on = activeArea === (a ? a.id : null);
                        const count = a ? projects.filter(p => p.areas.includes(a.id)).length : projects.length;
                        return (
                            <button
                                key={a ? a.id : 'all'}
                                type="button"
                                aria-pressed={on}
                                onClick={() => setActiveArea(a && !on ? a.id : null)}
                                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm border transition-colors ${on ? 'bg-light-text-primary text-white border-light-text-primary' : 'bg-light-primary text-light-text-secondary border-light-border hover:border-light-text-secondary'}`}
                            >
                                {a && <span className={`w-2 h-2 ${a.dot}`} aria-hidden="true" />}
                                {a ? a.label : 'All'}
                                <span className="tabular-nums opacity-60">{count}</span>
                            </button>
                        );
                    })}
                </div>
                {activeArea && (
                    <p className="-mt-3 mb-6 text-center text-sm text-light-text-secondary">
                        {areaOf(activeArea).hint}
                    </p>
                )}

                <div
                    ref={gridRef}
                    onPointerLeave={() => setKernelIds(new Set())}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
                >
                    {projects.map(renderProjectTile)}
                </div>
            </div>

            {/* Project Modal for Demo or Code */}
            {selectedProject && modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className={`bg-light-primary w-full flex flex-col border border-light-border ${modalType === 'info' ? 'max-w-3xl max-h-[90vh]' : 'max-w-6xl h-[90vh]'}`}>
                        <div className="flex justify-between items-center p-4 border-b border-light-border">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-light-text-primary">{selectedProject.title}</h3>
                                <p className="text-sm text-light-text-secondary">
                                    {modalType === 'demo' ? 'Live Demo' :
                                        modalType === 'article' ? articleLinkLabel(selectedProject) :
                                            modalType === 'pdf' ? 'PDF' :
                                                modalType === 'info' ? 'Overview' :
                                                    'Project Code & Details'}
                                </p>
                            </div>
                            {modalType === 'demo' && selectedProject.demo && (
                                <a
                                    href={selectedProject.demo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mr-3 px-3 py-1.5 text-sm flex items-center text-light-text-secondary border border-light-border hover:bg-light-secondary transition-colors"
                                >
                                    <ExternalLink size={14} className="mr-1.5" />
                                    Open in new tab
                                </a>
                            )}
                            <button
                                onClick={closeProjectModal}
                                className="p-1 hover:bg-light-secondary text-light-text-secondary border border-light-border"
                                aria-label="Close"
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
                                <div className="w-full h-full overflow-auto bg-light-primary">
                                    <div className="max-w-4xl mx-auto p-8">
                                        <div className="flex justify-center gap-4 mb-8">
                                            <a
                                                href={selectedProject.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                            >
                                                <Download size={16} className="mr-2" />
                                                Open in New Tab
                                            </a>

                                            {selectedProject.externalUrl && (
                                                <a
                                                    href={selectedProject.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                                >
                                                    <ExternalLink size={16} className="mr-2" />
                                                    Open source page
                                                </a>
                                            )}
                                        </div>

                                        <div className="bg-light-secondary p-4 border border-light-border shadow-md">
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
                                <div className="w-full h-full overflow-auto bg-light-primary">
                                    <div className="max-w-4xl mx-auto p-8">
                                        <div className="flex justify-center gap-4 mb-8">
                                            <a
                                                href={selectedProject.article}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                            >
                                                <ExternalLink size={16} className="mr-2" />
                                                View on Hugging Face
                                            </a>

                                            {selectedProject.demo && (
                                                <a
                                                    href={selectedProject.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                                >
                                                    <img src="https://colab.research.google.com/img/colab_favicon_256px.png" alt="Colab" className="w-5 h-5 mr-2" />
                                                    Open in Colab
                                                </a>
                                            )}

                                            {selectedProject.articlePt && (
                                                <a
                                                    href={selectedProject.articlePt}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                                >
                                                    <FileCode size={16} className="mr-2" />
                                                    Post (PT)
                                                </a>
                                            )}

                                            {selectedProject.pdfUrl && (
                                                <a
                                                    href={selectedProject.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                                >
                                                    <FileCode size={16} className="mr-2" />
                                                    PDF
                                                </a>
                                            )}
                                        </div>

                                        {articleLoading && (
                                            <div className="flex items-center justify-center p-12">
                                                <Loader2 size={40} className="animate-spin text-light-text-secondary" />
                                            </div>
                                        )}

                                        {articleError && (
                                            <div className="p-8 flex flex-col items-center justify-center">
                                                <AlertTriangle size={40} className="text-amber-500 mb-4" />
                                                <p className="text-red-400 text-center">{articleError}</p>
                                            </div>
                                        )}

                                        {!articleLoading && !articleError && articleContent && (
                                            <article className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-light-secondary p-8 shadow-md border border-light-border">
                                                <div className="prose-headings:text-light-text-primary prose-headings:border-b prose-headings:border-light-border/30 prose-headings:pb-2 prose-h1:text-3xl prose-h1:font-bold prose-h1:border-none prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-p:text-light-text-secondary prose-a:text-light-accent prose-a:no-underline hover:prose-a:text-light-accent/70 hover:prose-a:underline prose-code:text-light-accent prose-code:bg-light-primary/50 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-light-primary prose-pre:border prose-pre:border-light-border prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain prose-table:border-collapse prose-th:bg-light-primary prose-th:border prose-th:border-light-border prose-th:p-2 prose-td:border prose-td:border-light-border prose-td:p-2 prose-blockquote:border-l-4 prose-blockquote:border-light-accent/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-light-text-secondary/70">
                                                    <Suspense fallback={spinner}>
                                                        <MarkdownArticle content={articleContent} />
                                                    </Suspense>
                                                </div>
                                            </article>
                                        )}
                                    </div>
                                </div>
                            )}

                            {modalType === 'info' && (
                                <div className="w-full overflow-auto bg-light-primary p-8">
                                    {selectedProject.image && (
                                        <img
                                            src={selectedProject.image}
                                            alt={selectedProject.title}
                                            className="w-full max-h-56 object-cover border border-light-border mb-6"
                                            width={768}
                                            height={224}
                                            decoding="async"
                                        />
                                    )}
                                    <p className="text-light-text-secondary leading-relaxed mb-6">
                                        {selectedProject.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-6">
                                        {selectedProject.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 bg-light-secondary text-light-text-secondary text-xs border border-light-border"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.article && (
                                            <a
                                                href={selectedProject.article}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                            >
                                                <ExternalLink size={16} className="mr-2" />
                                                Open {articleLinkLabel(selectedProject)}
                                            </a>
                                        )}
                                        {selectedProject.pdfUrl && (
                                            <button
                                                onClick={() => openProjectModal(selectedProject, 'pdf')}
                                                className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                            >
                                                <FileCode size={16} className="mr-2" />
                                                {isDirectPdf(selectedProject.pdfUrl) ? 'PDF' : 'SSRN PDF'}
                                            </button>
                                        )}
                                        {selectedProject.demo && (
                                            <a
                                                href={selectedProject.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                            >
                                                <ExternalLink size={16} className="mr-2" />
                                                Demo
                                            </a>
                                        )}
                                        {selectedProject.github && (
                                            <a
                                                href={selectedProject.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-light-secondary text-light-text-primary font-medium hover:bg-light-tertiary transition-colors flex items-center border border-light-border"
                                            >
                                                <Github size={16} className="mr-2" />
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {modalType === 'repo' && (
                                <div className="flex flex-1 overflow-hidden">
                                    {/* File Selector Sidebar */}
                                    <div className="w-64 border-r border-light-border bg-light-primary overflow-y-auto">
                                        <div className="p-4 border-b border-light-border">
                                            <div className="flex items-center">
                                                <Github size={16} className="mr-2 text-light-text-secondary" />
                                                <a
                                                    href={selectedProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-mono text-light-accent hover:underline truncate"
                                                >
                                                    {selectedProject.github?.replace('https://github.com/', '')}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <h4 className="px-2 py-1 text-sm font-medium text-light-text-secondary">Some Project Files</h4>
                                            <ul className="mt-2">
                                                {selectedProject.codeExamples?.map((example: CodeExample, index: number) => (
                                                    <li key={index}>
                                                        <button
                                                            onClick={() => selectCodeExample(example)}
                                                            className={`w-full flex items-start p-2 text-left text-sm transition-colors border-b border-light-border ${selectedCodeExample && selectedCodeExample.path === example.path
                                                                ? 'bg-light-secondary text-light-text-primary'
                                                                : 'text-light-text-secondary hover:bg-light-secondary/50 hover:text-light-text-primary'
                                                                }`}
                                                        >
                                                            <FileCode size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">{example.path.split('/').pop()}</div>
                                                                <div className="text-xs text-light-text-secondary/70 mt-1">{example.description}</div>
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
                                            <div className="p-2 border-b border-light-border flex items-center justify-between bg-light-primary">
                                                <div className="flex items-center">
                                                    <FileCode size={16} className="mr-2 text-light-text-secondary" />
                                                    <span className="font-mono text-sm text-light-text-secondary">{selectedCodeExample.path}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (codeContent.content) {
                                                                navigator.clipboard.writeText(codeContent.content);
                                                            }
                                                        }}
                                                        className="flex items-center p-1 px-2 text-xs bg-light-secondary hover:bg-light-tertiary transition-colors text-light-text-secondary border border-light-border"
                                                        disabled={!codeContent.content || codeContent.loading}
                                                    >
                                                        <Download size={14} className="mr-1" />
                                                        Copy Code
                                                    </button>
                                                    <a
                                                        href={codeContent.htmlUrl || `${selectedProject.github}/blob/main/${selectedCodeExample.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center p-1 px-2 text-xs bg-light-secondary hover:bg-light-tertiary transition-colors text-light-text-secondary border border-light-border"
                                                    >
                                                        <ExternalLink size={14} className="mr-1" />
                                                        View on GitHub
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 overflow-auto bg-light-primary">
                                            {codeContent.loading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-light-primary bg-opacity-70 z-10">
                                                    <Loader2 size={30} className="animate-spin text-light-text-secondary" />
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
                                                        className="px-4 py-2 bg-light-secondary text-sm hover:bg-light-tertiary transition-colors text-light-text-secondary border border-light-border"
                                                    >
                                                        View Repository
                                                    </a>
                                                </div>
                                            )}

                                            {!codeContent.loading && !codeContent.error && codeContent.content && selectedCodeExample && (
                                                <div className="h-full overflow-auto">
                                                    <Suspense fallback={spinner}>
                                                        <CodeBlock
                                                            language={selectedCodeExample.language || getLanguageFromPath(selectedCodeExample.path)}
                                                            showLineNumbers={true}
                                                            customStyle={{
                                                                margin: 0,
                                                                padding: '16px',
                                                                fontSize: '14px',
                                                                height: 'auto',
                                                                minHeight: '100%',
                                                                background: '#ffffff',
                                                                color: '#24292F',
                                                            }}
                                                            codeTagProps={{
                                                                style: {
                                                                    color: '#24292F',
                                                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                                                                }
                                                            }}
                                                        >
                                                            {codeContent.content}
                                                        </CodeBlock>
                                                    </Suspense>
                                                </div>
                                            )}

                                            {!codeContent.loading && !codeContent.error && !codeContent.content && (
                                                <div className="flex items-center justify-center h-full p-6 text-light-text-secondary">
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
                            <div className="border-t border-light-border p-4 max-h-64 overflow-y-auto bg-light-secondary">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2 text-light-text-primary">Description</h4>
                                        <p className="text-sm text-light-text-secondary">{selectedProject.description}</p>

                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2 text-light-text-primary">Technologies</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.tags.map((tag: string) => (
                                                    <span key={tag} className="px-2 py-1 bg-light-primary text-light-text-secondary text-sm border border-light-border">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2 text-light-text-primary">Links</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedProject.github && (
                                                <a
                                                    href={selectedProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-light-primary text-light-text-primary hover:bg-light-secondary transition-colors flex items-center border border-light-border"
                                                >
                                                    <Github size={18} className="mr-2" />
                                                    GitHub Repository
                                                </a>
                                            )}

                                            {selectedProject.docs && (
                                                <a
                                                    href={selectedProject.docs}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-light-border hover:bg-light-secondary transition-colors flex items-center text-light-text-secondary"
                                                >
                                                    <ExternalLink size={18} className="mr-2" />
                                                    Docs
                                                </a>
                                            )}

                                            {selectedProject.demo && (
                                                <a
                                                    href={selectedProject.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`px-4 py-2 border border-light-border hover:bg-light-secondary transition-colors flex items-center text-light-text-secondary ${selectedProject.demo.includes('colab.research.google.com') ? 'bg-light-primary' : ''}`}
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
                                                    className="px-4 py-2 border border-light-border hover:bg-light-secondary transition-colors flex items-center text-light-text-secondary"
                                                    onClick={(e) => {
                                                        if (selectedProject.id === "peft-methods") {
                                                            e.preventDefault();
                                                            openProjectModal(selectedProject, 'article');
                                                        }
                                                    }}
                                                >
                                                    <FileCode size={18} className="mr-2" />
                                                    {articleLinkLabel(selectedProject)}
                                                </a>
                                            )}

                                            {selectedProject.articlePt && (
                                                <a
                                                    href={selectedProject.articlePt}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-light-border hover:bg-light-secondary transition-colors flex items-center text-light-text-secondary"
                                                >
                                                    <FileCode size={18} className="mr-2" />
                                                    Post (PT)
                                                </a>
                                            )}

                                            {selectedProject.pdfUrl && (
                                                <a
                                                    href={selectedProject.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-light-border hover:bg-light-secondary transition-colors flex items-center text-light-text-secondary"
                                                    onClick={(e) => {
                                                        if (isDirectPdf(selectedProject.pdfUrl!)) {
                                                            e.preventDefault();
                                                            openProjectModal(selectedProject, 'pdf');
                                                        }
                                                    }}
                                                >
                                                    <FileCode size={18} className="mr-2" />
                                                    {isDirectPdf(selectedProject.pdfUrl) ? 'PDF' : 'SSRN PDF'}
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

export default ProjectsSection;