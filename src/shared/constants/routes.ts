export /**
 *
 */
const ROUTES = {
  login: "/login",
  product: "/product",
  home: "/",
  features: "/features",
  architecture: "/architecture",
  pricing: "/pricing",
  opentelemetry: "/opentelemetry",
  selfHost: "/self-host",
  overview: "/overview",
  service: "/service",
  serviceDetail: "/services/$serviceName",
  logs: "/logs",
  traces: "/traces",
  traceDetail: "/traces/$traceId",
  traceCompare: "/traces/compare",
  metrics: "/metrics",
  infrastructure: "/infrastructure",
  errors: "/errors",
  saturation: "/saturation",
  saturationDatastoreDetail: "/saturation/datastores/$system",
  saturationKafkaTopicDetail: "/saturation/kafka/topics/$topic",
  saturationKafkaGroupDetail: "/saturation/kafka/groups/$groupId",

  settings: "/settings",
} as const;

/**
 *
 */
export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
