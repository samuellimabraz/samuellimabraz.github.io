import { useState, useEffect } from 'react';

interface StarsCache {
    [repoUrl: string]: {
        stars: number;
        timestamp: number;
    };
}

const CACHE_DURATION = 2000 * 60 * 60;
const starsCache: StarsCache = {};

export function useGithubStars(repoUrl: string | undefined): number | null {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        if (!repoUrl) {
            setStars(null);
            return;
        }

        // Check cache first
        const cached = starsCache[repoUrl];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setStars(cached.stars);
            return;
        }

        const fetchStars = async () => {
            try {
                // Extract owner and repo from GitHub URL
                const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                if (!match) {
                    setStars(null);
                    return;
                }

                const [, owner, repo] = match;
                const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    setStars(null);
                    return;
                }

                const data = await response.json();
                const starCount = data.stargazers_count || 0;

                // Update cache
                starsCache[repoUrl] = {
                    stars: starCount,
                    timestamp: Date.now()
                };

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

    useEffect(() => {
        const fetchAllStars = async () => {
            const newStarsMap = new Map<string, number>();
            const fetchPromises: Promise<void>[] = [];

            for (const repoUrl of repoUrls) {
                if (!repoUrl) continue;

                // Check cache first
                const cached = starsCache[repoUrl];
                if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                    newStarsMap.set(repoUrl, cached.stars);
                    continue;
                }

                const fetchPromise = (async () => {
                    try {
                        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                        if (!match) return;

                        const [, owner, repo] = match;
                        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

                        const response = await fetch(apiUrl);
                        if (!response.ok) return;

                        const data = await response.json();
                        const starCount = data.stargazers_count || 0;

                        // Update cache
                        starsCache[repoUrl] = {
                            stars: starCount,
                            timestamp: Date.now()
                        };

                        newStarsMap.set(repoUrl, starCount);
                    } catch (error) {
                        console.error('Error fetching GitHub stars for', repoUrl, error);
                    }
                })();

                fetchPromises.push(fetchPromise);
            }

            await Promise.all(fetchPromises);
            setStarsMap(new Map([...starsMap, ...newStarsMap]));
        };

        fetchAllStars();
    }, [repoUrls.join(',')]);

    return starsMap;
}

