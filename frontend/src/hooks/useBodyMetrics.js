import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/tracker';

const useBodyMetrics = (token, limit = 12) => {
    const [metrics, setMetrics] = useState({
        measurements: [],
        trends: {},
        latest: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/body-metrics/?limit=${limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMetrics(response.data);
                setError(null);
            } catch (err) {
                console.error('Erro ao buscar métricas corporais:', err);
                setError('Não foi possível carregar as métricas');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [token, limit]);

    return { metrics, isLoading, error };
};

export default useBodyMetrics;
