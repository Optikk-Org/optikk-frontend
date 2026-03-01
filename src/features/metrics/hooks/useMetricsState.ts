import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useURLFilters } from '@hooks/useURLFilters';

const METRICS_URL_FILTER_CONFIG = {
    params: [
        { key: 'service', type: 'string' as const, defaultValue: '' },
        { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
    ],
};

export function useMetricsState() {
    const [searchParams, setSearchParams] = useSearchParams();

    /* ── URL-synced filter state for service & errorsOnly ── */
    const {
        values: urlValues,
        setters: urlSetters,
    } = useURLFilters(METRICS_URL_FILTER_CONFIG);

    const selectedService = urlValues.service || null;
    const setSelectedService = (v: string | null) => urlSetters.service(v || '');
    const showErrorsOnly = urlValues.errorsOnly;
    const setShowErrorsOnly = urlSetters.errorsOnly;

    /* ── Tab state (kept separate — immediate URL sync, no debounce needed) ── */
    const queryTab = searchParams.get('tab') === 'latency' ? 'latency' : 'overview';
    const [activeTab, setActiveTab] = useState(queryTab);

    useEffect(() => {
        if (queryTab !== activeTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab, activeTab]);

    const onTabChange = (tabKey) => {
        setActiveTab(tabKey);
        const next = new URLSearchParams(searchParams);
        if (tabKey === 'latency') {
            next.set('tab', 'latency');
        } else {
            next.delete('tab');
        }
        setSearchParams(next, { replace: true });
    };

    return {
        selectedService,
        setSelectedService,
        showErrorsOnly,
        setShowErrorsOnly,
        activeTab,
        setActiveTab,
        onTabChange
    };
}
