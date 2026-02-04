import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useGlobal } from "@/context/index";

export const useCompany = () => {
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const { setCompany } = useGlobal();

  const getCompany = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching company data:', error);
        setCompany(null);
        setLoading(false);
        return;
      }

      setCompany(data);
      setLoading(false);
    } catch (error) {
      console.error('Exception fetching company data:', error);
      setCompany(null);
      setLoading(false);
    }
  };

  /**
   * Create a new company
   */
  const createCompany = async (companyData) => {
    try {
      const { data, error } = await supabase
        .from('company')
        .insert(companyData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception creating company:', error);
      throw error;
    }
  };

  /**
   * Update company data
   */
  const updateCompany = async (companyId, updates, handleSaveClick = null) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      setLoadingUpdate(true);
      const { data, error } = await supabase
        .from('company')
        .update(updates)
        .eq('id', companyId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating company:', error);
        setLoadingUpdate(false);
        return;
      }

      setCompany(data);
      setLoadingUpdate(false);
      if (handleSaveClick) {
        handleSaveClick();
      }
    } catch (error) {
      console.error('Exception updating company:', error);
      setLoadingUpdate(false);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return {
    loading,
    loadingUpdate,
    getCompany,
    createCompany,
    updateCompany,
  };
};
