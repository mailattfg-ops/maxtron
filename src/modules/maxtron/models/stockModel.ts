import { supabase } from '../../../config/supabase';

export const StockModel = {
    getRMStockSummary: async (companyId?: string) => {
        // Fetch all materials
        let matQuery = supabase.from('raw_materials').select('*');
        if (companyId) matQuery = matQuery.eq('company_id', companyId);
        const { data: materials, error: matErr } = await matQuery;
        if (matErr) throw new Error(matErr.message);

        // Fetch all purchase items properly linked to their entries
        let purQuery = supabase.from('purchase_entry_items').select('rm_id, received_quantity, purchase_entries!inner(company_id)');
        if (companyId) purQuery = purQuery.eq('purchase_entries.company_id', companyId);
        const { data: purchaseItems, error: purErr } = await purQuery;

        // Fetch all consumptions
        let conQuery = supabase.from('material_consumptions').select('rm_id, quantity_used');
        if (companyId) conQuery = conQuery.eq('company_id', companyId);
        const { data: consumptions, error: conErr } = await conQuery;

        // Note: Returns functionality is temporarily bypassed for stock calculation 
        // because purchase_returns lacks item-level (rm_id) traceability in its current schema.

        // Calculate Stock
        const stockSummary = materials.map(m => {
            const purchased = purchaseItems?.filter(p => p.rm_id === m.id)
                .reduce((acc, curr) => acc + Number(curr.received_quantity || 0), 0) || 0;

            const consumed = consumptions?.filter(c => c.rm_id === m.id)
                .reduce((acc, curr) => acc + Number(curr.quantity_used || 0), 0) || 0;

            return {
                ...m,
                purchased,
                consumed,
                balance: purchased - consumed
            };
        });

        return stockSummary;
    }
};
