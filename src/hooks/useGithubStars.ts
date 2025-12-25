import { useEffect, useMemo, useState } from 'react';
import { parseGitHubRepoUrl, safeLocalStorageGet, safeLocalStorageSet } from '../lib/github';

interface StarsCache {
    [repoUrl: string]: {
        stars: number;
        timestamp: number;
    };
}

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 2 hours
const starsCache: StarsCache = {};
const inflight: Record<string, Promise<number | null>> = {};

const STARS_STORAGE_PREFIX = 'gh_stars_cache_v1:';
const RATE_LIMIT_RESET_KEY = 'gh_rate_limit_reset_v1';

function getRateLimitResetMs(): number | null {
    const raw = safeLocalStorageGet(RATE_LIMIT_RESET_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

function setRateLimitResetMs(ms: number): void {
    safeLocalStorageSet(RATE_LIMIT_RESET_KEY, String(ms));
}

function getStarsCacheKey(owner: string, repo: string): string {
    return `${STARS_STORAGE_PREFIX}${owner}/${repo}`;
}

function readPersistedStars(owner: string, repo: string): { stars: number; timestamp: number } | null {
    const raw = safeLocalStorageGet(getStarsCacheKey(owner, repo));
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as { stars?: unknown; timestamp?: unknown };
        if (typeof parsed.stars !== 'number' || typeof parsed.timestamp !== 'number') return null;
        return { stars: parsed.stars, timestamp: parsed.timestamp };
    } catch {
        return null;
    }
}

function writePersistedStars(owner: string, repo: string, stars: number): void {
    safeLocalStorageSet(getStarsCacheKey(owner, repo), JSON.stringify({ stars, timestamp: Date.now() }));
}

export function useGithubStars(repoUrl: string | undefined): number | null {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        if (!repoUrl) {
            setStars(null);
            return;
        }

        const fetchStars = async () => {
            try {
                const ref = parseGitHubRepoUrl(repoUrl);
                if (!ref) {
                    setStars(null);
                    return;
                }

                const { owner, repo } = ref;
                const memKey = `${owner}/${repo}`;

                const persisted = readPersistedStars(owner, repo);
                if (persisted && Date.now() - persisted.timestamp < CACHE_DURATION) {
                    setStars(persisted.stars);
                    starsCache[memKey] = { stars: persisted.stars, timestamp: persisted.timestamp };
                    return;
                }

                const cached = starsCache[memKey];
                if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                    setStars(cached.stars);
                    return;
                }

                const rlReset = getRateLimitResetMs();
                if (rlReset && Date.now() < rlReset) {
                    if (persisted) {
                        setStars(persisted.stars);
                        return;
                    }
                    if (cached) {
                        setStars(cached.stars);
                        return;
                    }
                    setStars(null);
                    return;
                }

                if (!inflight[memKey]) {
                    inflight[memKey] = (async () => {
                        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
                        const response = await fetch(apiUrl, {
                            headers: {
                                Accept: 'application/vnd.github+json'
                            }
                        });

                        if (!response.ok) {
                            if (response.status === 403 || response.status === 429) {
                                const resetHeader = response.headers.get('x-ratelimit-reset');
                                if (resetHeader) {
                                    const resetSeconds = Number(resetHeader);
                                    if (Number.isFinite(resetSeconds)) {
                                        setRateLimitResetMs(resetSeconds * 1000);
                                    }
                                }
                            }
                            return null;
                        }

                        const data = await response.json();
                        const starCount = data?.stargazers_count ?? null;
                        return typeof starCount === 'number' ? starCount : null;
                    })().finally(() => {
                        delete inflight[memKey];
                    });
                }

                const starCount = await inflight[memKey];
                if (starCount === null) {
                    if (persisted) {
                        setStars(persisted.stars);
                        return;
                    }
                    setStars(null);
                    return;
                }

                // Update cache
                starsCache[memKey] = { stars: starCount, timestamp: Date.now() };
                writePersistedStars(owner, repo, starCount);

                setStars(starCount);
            } catch (error) {
                console.error('Error fetching GitHub stars:', error);
                setStars(null);
            }
        };

        fetchStars();
    }, [repoUrl]);

    return stars;
}

export function useMultipleGithubStars(repoUrls: (string | undefined)[]): Map<string, number> {
    const [starsMap, setStarsMap] = useState<Map<string, number>>(new Map());

    const normalizedRepoUrls = useMemo(() => {
        const unique = new Set<string>();
        for (const url of repoUrls) {
            if (!url) continue;
            unique.add(url);
        }
        return Array.from(unique).sort();
    }, [repoUrls.join(',')]);

    useEffect(() => {
        const fetchAllStars = async () => {
            console.log('[useMultipleGithubStars] Starting fetch for', normalizedRepoUrls.length, 'repos');
            const newStarsMap = new Map<string, number>();
            const fetchPromises: Promise<void>[] = [];

            for (const repoUrl of normalizedRepoUrls) {
                if (!repoUrl) continue;

                const fetchPromise = (async () => {
                    try {
                        const ref = parseGitHubRepoUrl(repoUrl);
                        if (!ref) return;

                        const { owner, repo } = ref;
                        const memKey = `${owner}/${repo}`;

                        const persisted = readPersistedStars(owner, repo);
                        if (persisted && Date.now() - persisted.timestamp < CACHE_DURATION) {
                            console.log(`[useMultipleGithubStars] - ${owner}/${repo} = ${persisted.stars} (from localStorage)`);
                            newStarsMap.set(repoUrl, persisted.stars);
                            starsCache[memKey] = { stars: persisted.stars, timestamp: persisted.timestamp };
                            return;
                        }

                        const cached = starsCache[memKey];
                        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                            console.log(`[useMultipleGithubStars] - ${owner}/${repo} = ${cached.stars} (from memory)`);
                            newStarsMap.set(repoUrl, cached.stars);
                            return;
                        }

                        const rlReset = getRateLimitResetMs();
                        if (rlReset && Date.now() < rlReset) {
                            console.log(`[useMultipleGithubStars] ⏳ Rate limited, skipping ${owner}/${repo}`);
                            if (persisted) newStarsMap.set(repoUrl, persisted.stars);
                            return;
                        }

                        if (!inflight[memKey]) {
                            inflight[memKey] = (async () => {
                                const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
                                const response = await fetch(apiUrl, {
                                    headers: { Accept: 'application/vnd.github+json' }
                                });
                                if (!response.ok) {
                                    console.log(`[useMultipleGithubStars] - HTTP ${response.status} for ${owner}/${repo}`);
                                    if (response.status === 403 || response.status === 429) {
                                        const resetHeader = response.headers.get('x-ratelimit-reset');
                                        console.log(`[useMultipleGithubStars] 🚫 Rate limited! Reset header: ${resetHeader}`);
                                        if (resetHeader) {
                                            const resetSeconds = Number(resetHeader);
                                            if (Number.isFinite(resetSeconds)) {
                                                setRateLimitResetMs(resetSeconds * 1000);
                                            }
                                        }
                                    }
                                    return null;
                                }
                                const data = await response.json();
                                const starCount = data?.stargazers_count ?? null;
                                return typeof starCount === 'number' ? starCount : null;
                            })().finally(() => {
                                delete inflight[memKey];
                            });
                        }

                        const starCount = await inflight[memKey];
                        if (starCount === null) {
                            console.log(`[useMultipleGithubStars] - ${owner}/${repo} returned null, using fallback`);
                            if (persisted) newStarsMap.set(repoUrl, persisted.stars);
                            return;
                        }

                        // Update cache
                        starsCache[memKey] = { stars: starCount, timestamp: Date.now() };
                        writePersistedStars(owner, repo, starCount);

                        console.log(`[useMultipleGithubStars] - ${owner}/${repo} = ${starCount} stars`);
                        newStarsMap.set(repoUrl, starCount);
                    } catch (error) {
                        console.error('[useMultipleGithubStars] x Error fetching GitHub stars for', repoUrl, error);
                    }
                })();

                fetchPromises.push(fetchPromise);
            }

            await Promise.all(fetchPromises);
            console.log('[useMultipleGithubStars] Fetched stars for', newStarsMap.size, 'repos:', Object.fromEntries(newStarsMap));
            setStarsMap(prev => {
                const merged = new Map([...prev, ...newStarsMap]);
                console.log('[useMultipleGithubStars] Updated starsMap, total entries:', merged.size);
                return merged;
            });
        };

        fetchAllStars();
    }, [normalizedRepoUrls.join(',')]);

    return starsMap;
}

