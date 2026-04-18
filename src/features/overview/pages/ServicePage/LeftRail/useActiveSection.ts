import { useEffect, useState } from "react";

function observeSections(ids: readonly string[], onChange: (id: string) => void): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) onChange(visible.target.id);
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  const elements: Element[] = [];
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
      elements.push(element);
    }
  }
  return () => {
    for (const element of elements) observer.unobserve(element);
    observer.disconnect();
  };
}

export function useActiveSection(sectionIds: readonly string[]): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;
    return observeSections(sectionIds, setActiveId);
  }, [sectionIds]);

  return activeId;
}
