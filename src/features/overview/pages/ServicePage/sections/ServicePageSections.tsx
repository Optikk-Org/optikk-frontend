import ErrorsSection from "./ErrorsSection";
import GoldenSignalsSection from "./GoldenSignalsSection";
import PlaceholderSection from "./PlaceholderSection";
import SloSection from "./SloSection";

interface ServicePageSectionsProps {
  readonly serviceName: string;
}

export default function ServicePageSections({ serviceName }: ServicePageSectionsProps) {
  return (
    <>
      <GoldenSignalsSection serviceName={serviceName} />
      <PlaceholderSection
        id="deployments"
        title="Deployments"
        hint="Release timeline and risk land in Phase 3 alongside the comparator upgrade."
      />
      <PlaceholderSection
        id="dependencies"
        title="Dependencies"
        hint="Mini topology + top callers land next."
      />
      <PlaceholderSection
        id="resources"
        title="Resources"
        hint="Top endpoints table lands next."
      />
      <ErrorsSection serviceName={serviceName} />
      <SloSection serviceName={serviceName} />
      <PlaceholderSection
        id="traces"
        title="Traces"
        hint="Recent error traces panel lands next."
      />
      <PlaceholderSection id="logs" title="Logs" hint="Correlated error logs panel lands next." />
    </>
  );
}
