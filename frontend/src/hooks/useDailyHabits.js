// frontend/src/hooks/useDailyHabits.js

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Assumindo que você usa um axiosInstance configurado
import { format } from 'date-fns';

const useDailyHabits = (currentUserId) => {
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para buscar e mesclar os dados
    const fetchHabits = useCallback(async () => {
        if (!currentUserId) return;
        setIsLoading(true);
        setError(null);

        try {
            // 1. Busca todos os hábitos (lista mestra)
            const masterHabitsResponse = await axiosInstance.get('/tracker/habits/');
            const masterHabits = masterHabitsResponse.data;

            // 2. Busca os logs criados para HOJE
            // O backend já filtra por usuário e data de hoje.
            const dailyLogsResponse = await axiosInstance.get('/tracker/daily-habits/');
            const dailyLogs = dailyLogsResponse.data;

            // 3. Mescla as duas listas
            const mergedHabits = masterHabits.map(habit => {
                const log = dailyLogs.find(log => log.habit === habit.id);
                return {
                    ...habit,
                    // Adiciona o status do log e o ID do log se existir
                    log_id: log ? log.id : null,
                    completed: log ? log.completed : false,
                    value: log ? log.value : null,
                };
            });

            setHabits(mergedHabits);
        } catch (err) {
            console.error("Erro ao buscar hábitos diários:", err);
            setError("Falha ao carregar hábitos. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // Roda o fetch na montagem
    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);


    // Função para toggle (marcar/desmarcar) um hábito
    const toggleHabit = useCallback(async (habitId, currentLogId, currentStatus) => {
        const habitToUpdate = habits.find(h => h.id === habitId);
        if (!habitToUpdate) return;
        
        // Define o novo estado (Completa se estiver Incompleta, e vice-versa)
        const newCompletedStatus = !currentStatus;
        
        try {
            // Se o Log já existe, faz PATCH (atualiza)
            if (currentLogId) {
                await axiosInstance.patch(`/tracker/daily-habits/${currentLogId}/`, {
                    completed: newCompletedStatus,
                    // Você pode adicionar 'value' aqui se for um hábito quantificável
                });
            } else {
                // Se o Log não existe, faz POST (cria)
                const newLogDate = format(new Date(), 'yyyyMMdd');
                const response = await axiosInstance.post('/tracker/daily-habits/', {
                    habit: habitId,
                    completed: newCompletedStatus,
                    date: newLogDate, // O backend já usa a data de hoje, mas é bom enviar
                });
                // O backend retornará o novo log. O ID dele precisa ser atualizado no state.
                const newLogId = response.data.id;
                
                // Atualiza o state local com o novo log_id
                setHabits(prevHabits => 
                    prevHabits.map(h => 
                        h.id === habitId ? { ...h, log_id: newLogId, completed: newCompletedStatus } : h
                    )
                );
                return; // Já atualizou o state.
            }

            // Se for PATCH, apenas atualiza o status localmente após o sucesso
            setHabits(prevHabits => 
                prevHabits.map(h => 
                    h.id === habitId ? { ...h, completed: newCompletedStatus } : h
                )
            );
        } catch (err) {
            console.error("Erro ao alternar hábito:", err);
            alert(`Falha ao ${newCompletedStatus ? 'marcar' : 'desmarcar'} o hábito.`);
        }
    }, [habits]);


    return { habits, isLoading, error, toggleHabit, refetch: fetchHabits };
};

export default useDailyHabits;