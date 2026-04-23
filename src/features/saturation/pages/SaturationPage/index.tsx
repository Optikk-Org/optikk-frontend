import { useNavigate } from "@tanstack/react-router";

import { PageShell } from "@shared/components/ui";

import { SaturationDataTables } from "./components/SaturationDataTables";
import { SaturationExplorerToolbar } from "./components/SaturationExplorerToolbar";
import { SaturationPageHeader } from "./components/SaturationPageHeader";
import { SaturationStatTilesGrid } from "./components/SaturationStatTilesGrid";
import { KAFKA_TOPICS, SECTION_DATASTORES } from "./constants";
import { useSaturationExplorerModel } from "./hooks/useSaturationExplorerModel";
import { useSaturationLegacyRedirect } from "./hooks/useSaturationLegacyRedirect";

export default function SaturationPage(): JSX.Element {
  const navigate = useNavigate();
  const model = useSaturationExplorerModel();

  useSaturationLegacyRedirect(model.searchParams);

  const datastoreSummary = model.datastoreSummaryQuery.data;
  const kafkaSummary = model.kafkaSummaryQuery.data;

  const primaryTableError =
    model.activeSection === SECTION_DATASTORES
      ? model.datastoreSystemsQuery.error
      : model.kafkaView === KAFKA_TOPICS
        ? model.kafkaTopicsQuery.error
        : model.kafkaGroupsQuery.error;

  return (
    <PageShell>
      <SaturationPageHeader activeSection={model.activeSection} />

      {primaryTableError ? (
        <div
          className="rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-red-300 text-sm"
          role="alert"
        >
          Could not load saturation data: {primaryTableError.message}
        </div>
      ) : null}

      <SaturationStatTilesGrid
        activeSection={model.activeSection}
        datastoreSummary={datastoreSummary}
        kafkaSummary={kafkaSummary}
      />

      <SaturationExplorerToolbar
        activeSection={model.activeSection}
        kafkaView={model.kafkaView}
        storeType={model.storeType}
        queryText={model.queryText}
        setSearchValue={model.setSearchValue}
      />

      <SaturationDataTables
        activeSection={model.activeSection}
        kafkaView={model.kafkaView}
        datastoreRows={model.datastoreRows}
        kafkaTopicRows={model.kafkaTopicRows}
        kafkaGroupRows={model.kafkaGroupRows}
        navigate={navigate}
      />
    </PageShell>
  );
}
