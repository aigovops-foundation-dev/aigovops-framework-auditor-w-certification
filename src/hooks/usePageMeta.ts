import { useEffect } from "react";

interface Meta {
  title: string;
  description?: string;
  /** Path-only canonical (e.g. "/docs"). Combined with location.origin. */
  canonical?: string;
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
}

/**
 * Lightweight per-page <title> + meta description + canonical + JSON-LD updater.
 * Cleans up any tags it added on unmount so SPA navigation stays consistent.
 */
export function usePageMeta({ title, description, canonical, jsonLd }: Meta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title.length > 60 ? title.slice(0, 57) + "…" : title;

    const created: HTMLElement[] = [];
    const upsertMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      upsertMeta("description", description.slice(0, 160));
      upsertMeta("og:description", description.slice(0, 160), "property");
    }
    upsertMeta("og:title", title, "property");
    upsertMeta("twitter:title", title);

    let canonicalEl: HTMLLinkElement | null = null;
    if (canonical) {
      canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
        created.push(canonicalEl);
      }
      canonicalEl.setAttribute("href", new URL(canonical, window.location.origin).toString());
    }

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
      created.push(scriptEl);
    }

    return () => {
      document.title = prevTitle;
      for (const el of created) el.remove();
    };
  }, [title, description, canonical, jsonLd]);
}
