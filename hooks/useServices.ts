import { useState, useEffect, useCallback } from 'react';
import { TREATMENTS, Treatment } from '../constants/treatments';
import { SUPPLEMENTS, Supplement } from '../constants/supplements';
import { supabase } from '../lib/supabase';

export const useServices = () => {
    const [treatments, setTreatments] = useState<Treatment[]>(TREATMENTS);
    const [supplements, setSupplements] = useState<Supplement[]>(SUPPLEMENTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Load treatments from Supabase
            const { data: treatmentsData, error: treatmentsError } = await supabase
                .from('treatments')
                .select('*, benefits:treatment_benefits(benefit)');

            if (!treatmentsError && treatmentsData) {
                // Adapt the data structure to match the frontend expectations
                const formattedTreatments = treatmentsData.map(t => ({
                    ...t,
                    benefits: t.benefits?.map((b: any) => b.benefit) || []
                }));
                setTreatments(formattedTreatments);
            } else if (treatmentsError) {
                console.error('Error loading treatments from Supabase:', treatmentsError);
            }

            // Load supplements from Supabase
            const { data: supplementsData, error: supplementsError } = await supabase
                .from('supplements')
                .select('*, matchingTreatments:supplement_matching(treatment_id)');

            if (!supplementsError && supplementsData) {
                // Adapt the data structure to match the frontend expectations
                const formattedSupplements = supplementsData.map(s => ({
                    ...s,
                    matchingTreatments: s.matchingTreatments?.map((m: any) => m.treatment_id) || []
                }));
                setSupplements(formattedSupplements);
            } else if (supplementsError) {
                console.error('Error loading supplements from Supabase:', supplementsError);
            }

            setLoading(false);
        } catch (err) {
            console.warn('Usando datos estáticos como fallback:', err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { treatments, supplements, loading, error, refetch: fetchData };
};
