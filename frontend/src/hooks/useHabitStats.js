import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/tracker';

const useHabitStats = (token) => {
    const [stats, setStats] = useState({
        total_habits: 0,
        completed_today: 0,
        completed_week: 0,
        streak: 0,
        score: 0,
        workout_count: 0,
        completion_rate_today: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/habit-stats/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStats(response.data);
                setError(null);
            } catch (err) {
                console.error('Erro ao buscar estatísticas de hábitos:', err);
                setError('Não foi possível carregar as estatísticas');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    return { stats, isLoading, error };
};

export default useHabitStats;
