import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string, options?: { replace?: boolean; scrollToTop?: boolean }) => void;
  queryParams: URLSearchParams;
  params: Record<string, string>;
  isMatch: (pattern: string) => boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function normalizePath(p: string): string {
  if (!p) return '/';
  const clean = p.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  const [searchString, setSearchString] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search;
    }
    return '';
  });

  const queryParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const navigate = useCallback((to: string, options?: { replace?: boolean; scrollToTop?: boolean }) => {
    if (typeof window === 'undefined') return;

    const [targetPath, targetSearch] = to.split('?');
    const normalized = normalizePath(targetPath);

    if (options?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    setCurrentPath(normalized);
    setSearchString(targetSearch ? `?${targetSearch}` : '');

    if (options?.scrollToTop !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Sync with browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      setSearchString(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept internal <a> links globally
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Don't intercept if modifier keys were pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only intercept internal relative links starting with "/"
      if (href.startsWith('/') && !href.startsWith('//') && !target.target && !target.hasAttribute('download')) {
        e.preventDefault();
        navigate(href);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [navigate]);

  // Extract route parameters (e.g. /services/:slug, /careers/:slug, /resources/:slug)
  const params = useMemo(() => {
    const result: Record<string, string> = {};
    const segments = currentPath.split('/').filter(Boolean);

    if (segments[0] === 'services' && segments[1]) {
      result.slug = segments[1];
    } else if (segments[0] === 'careers' && segments[1]) {
      result.slug = segments[1];
    } else if (segments[0] === 'resources' && segments[1]) {
      result.slug = segments[1];
    }

    return result;
  }, [currentPath]);

  const isMatch = useCallback((pattern: string): boolean => {
    const normPattern = normalizePath(pattern);
    if (normPattern === '/') {
      return currentPath === '/';
    }
    return currentPath === normPattern || currentPath.startsWith(normPattern + '/');
  }, [currentPath]);

  const value = useMemo(
    () => ({
      currentPath,
      navigate,
      queryParams,
      params,
      isMatch,
    }),
    [currentPath, navigate, queryParams, params, isMatch]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
