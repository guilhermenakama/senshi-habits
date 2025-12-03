import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// 1. SOLUÇÃO URL: A URL deve incluir o sub-router '/tracker/' e o prefixo do Django 'api'
const API_URL = import.meta.env.VITE_API_URL + '/api/tracker';

const useHabits = (token) => {
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoiza o config para evitar recriações
    const config = useMemo(() => ({
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }), [token]);

    // Função para buscar todos os hábitos
    const fetchHabits = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Rota ajustada para ser mais robusta
            const response = await axios.get(`${API_URL}/habits/`, config);

            // SOLUÇÃO TIPAGEM: 2. Cria uma cópia do array (spread [...]) antes de ordenar.
            // O .sort() em JavaScript pode ser problemático se usado diretamente no state.
            const sortedData = [...response.data].sort((a, b) => a.id - b.id);

            console.log('Hábitos carregados:', sortedData);
            console.log('Primeiro hábito (para debug):', sortedData[0]);

            setHabits(sortedData);
            setError(null);
        } catch (err) {
            console.error("Erro ao buscar hábitos:", err);
            if (err.response?.status === 401) {
                setError("Sessão expirada. Faça login novamente.");
            } else {
                setError("Não foi possível carregar os hábitos.");
            }
            setHabits([]); // Limpa a lista em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [token, config]);

    // Função para criar um novo hábito
    const createHabit = async (name, category = '', frequency = 'Diário') => {
        try {
            // API AJUSTE: O modelo espera 'name', 'category' e 'target_frequency' (do seu models.py)
            const newHabitData = {
                name: name,
                category: category,
                target_frequency: frequency
            }; 
            
            // Rota ajustada
            const response = await axios.post(`${API_URL}/habits/`, newHabitData, config);
            
            // Atualiza a lista local de hábitos de forma segura e ordenada
            const updatedHabits = [...habits, response.data].sort((a, b) => a.id - b.id);
            setHabits(updatedHabits);
            
            return response.data;
        } catch (err) {
            console.error("Erro ao criar hábito:", err.response?.data || err);
            throw new Error(err.response?.data?.name?.[0] || "Falha ao criar o hábito.");
        }
    };

    // Função para deletar um hábito (opcional, mas útil)
    const deleteHabit = async (id) => {
        if (!id) {
            console.error("ID do hábito está undefined ou null");
            throw new Error("ID do hábito inválido");
        }

        console.log('Deletando hábito com ID:', id);

        try {
            const url = `${API_URL}/habits/${id}/`;
            console.log('URL de delete:', url);

            await axios.delete(url, config);

            // Remove o hábito da lista local
            setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
            console.log('Hábito deletado com sucesso');
        } catch (err) {
            console.error("Erro ao deletar hábito:", err);
            console.error("ID que tentou deletar:", id);
            throw new Error(err.response?.data?.error || "Falha ao deletar o hábito.");
        }
    };

    useEffect(() => {
        fetchHabits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Depende APENAS do token, não do fetchHabits

    return { habits, isLoading, error, fetchHabits, createHabit, deleteHabit };
};

export default useHabits;