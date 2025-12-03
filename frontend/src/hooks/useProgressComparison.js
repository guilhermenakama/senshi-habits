import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/tracker';

const useProgressComparison = (token, period = 'month') => {
    const [comparison, setComparison] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComparison = useCallback(async (customDays = null) => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            let url = `${API_URL}/progress-comparison/?period=${period}`;
            if (period === 'custom' && customDays) {
                url = `${API_URL}/progress-comparison/?period=custom&days=${customDays}`;
            }

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setComparison(response.data);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar comparação de progresso:', err);
            setError('Não foi possível carregar a comparação');
        } finally {
            setIsLoading(false);
        }
    }, [token, period]);

    useEffect(() => {
        fetchComparison();
    }, [fetchComparison]);

    return { comparison, isLoading, error, refetch: fetchComparison };
};

export default useProgressComparison;
