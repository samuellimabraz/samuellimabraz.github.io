export interface SectionProps {
    scrollDirection: 'up' | 'down';
}

export interface Project {
    id: string;
    title: string;
    description: string;
    tags: string[];
    github?: string;
    demo?: string;
    article?: string;
    articlePt?: string;
    image: string;
    embedUrl?: string;
    featured: boolean;
    codeExamples?: CodeExample[];
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