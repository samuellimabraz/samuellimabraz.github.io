export interface SectionProps {
    scrollDirection: 'up' | 'down';
}

export type ProjectArea = 'vision' | 'robotics' | 'localization' | 'edge' | 'training' | 'llm' | 'embedded' | 'software';

export interface Project {
    id: string;
    title: string;
    description: string;
    tags: string[];
    areas: ProjectArea[];
    github?: string;
    demo?: string;
    docs?: string;
    article?: string;
    articleLabel?: string;
    articlePt?: string;
    image: string;
    embedUrl?: string;
    featured: boolean;
    codeExamples?: CodeExample[];
    pdfUrl?: string;
    externalUrl?: string;
    languagePt?: boolean;
}

export interface Competition {
    id: string;
    event: string;
    fullName: string;
    result: string;
    extra?: string;
    podium: boolean;
    date: string;
    location: string;
    summary: string;
    video: string;
    poster: string;
    projectId: string;
    codeUrl: string;
    modelsUrl?: string;
    eventUrl: string;
}

export interface CodeExample {
    path: string;
    description: string;
    language: string;
}

export interface CodeContent {
    content: string;
    loading: boolean;
    error: string | null;
}
