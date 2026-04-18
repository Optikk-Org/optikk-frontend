import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export interface ServiceIdentity {
  readonly serviceName: string;
  readonly isValid: boolean;
}

export function useServiceIdentity(): ServiceIdentity {
  const params = useParams({ strict: false });
  return useMemo(() => {
    const raw = typeof params.serviceName === "string" ? params.serviceName : "";
    const serviceName = decodeURIComponent(raw).trim();
    return { serviceName, isValid: serviceName.length > 0 };
  }, [params.serviceName]);
}
