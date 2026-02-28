/**
 * Saturation Service — API calls for Kafka, database, and queue saturation monitoring.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const saturationService = {
    // ── Kafka ───────────────────────────────────────────────────────────────
    async getKafkaQueueLag(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/kafka/queue-lag`, { params: { startTime, endTime } });
    },

    async getKafkaProductionRate(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/kafka/production-rate`, { params: { startTime, endTime } });
    },

    async getKafkaConsumptionRate(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/kafka/consumption-rate`, { params: { startTime, endTime } });
    },

    // ── Database ────────────────────────────────────────────────────────────
    async getDatabaseQueryByTable(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/database/query-by-table`, { params: { startTime, endTime } });
    },

    async getDatabaseAvgLatency(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/database/avg-latency`, { params: { startTime, endTime } });
    },

    async getDatabaseCacheSummary(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/database/latency-summary`, { params: { startTime, endTime } });
    },

    async getDatabaseSystemsBreakdown(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/database/systems`, { params: { startTime, endTime } });
    },

    async getDatabaseTopTablesMetrics(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/database/top-tables`, { params: { startTime, endTime } });
    },

    // ── Queue ───────────────────────────────────────────────────────────────
    async getQueueConsumerLag(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/queue/consumer-lag`, { params: { startTime, endTime } });
    },

    async getQueueTopicLag(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/queue/topic-lag`, { params: { startTime, endTime } });
    },

    async getQueueTopQueuesStats(teamId, startTime, endTime) {
        return api.get(`${BASE}/saturation/queue/top-queues`, { params: { startTime, endTime } });
    },
};
