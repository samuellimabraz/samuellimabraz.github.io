export interface GitHubRepoRef {
    owner: string;
    repo: string;
}

export function parseGitHubRepoUrl(repoUrl: string): GitHubRepoRef | null {
    try {
        const u = new URL(repoUrl);
        if (u.hostname !== 'github.com') return null;
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length < 2) return null;
        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/i, '');
        if (!owner || !repo) return null;
        return { owner, repo };
    } catch {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)(?:[/?#]|$)/i);
        if (!match) return null;
        const owner = match[1];
        const repo = match[2].replace(/\.git$/i, '');
        if (!owner || !repo) return null;
        return { owner, repo };
    }
}

export function safeLocalStorageGet(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function safeLocalStorageSet(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
    }
}


