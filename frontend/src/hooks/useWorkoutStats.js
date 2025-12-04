// frontend/src/hooks/useWorkoutStats.js

import { useState, useEffect, useCallback } from 'react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000/api/tracker'
  : `${window.location.protocol}//${window.location.host}/api/tracker`; 

const useWorkoutStats = (token) => {
    const [stats, setStats] = useState({ count: 0, target: 5 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/workout-stats/weekly/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            setStats({
                count: data.count, 
                target: data.target 
            });
        } catch (err) {
            console.error("Erro ao buscar estatísticas de treino:", err);
            // Mantém o default em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
};

export default useWorkoutStats;