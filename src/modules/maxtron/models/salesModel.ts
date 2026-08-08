import { supabase } from '../../../config/supabase';

export const SalesModel = {
    getOrders: async (companyId: string) => {
        const { data, error } = await supabase
            .from('customer_orders')
            .select(`
                *,
                customers(customer_name, customer_code),
                executive:users!executive_id(name),
                items:customer_order_items(
                    *,
                    finished_products(product_name, product_code)
                )
            `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    getNextNumber: async (companyId?: string) => {
        let query = supabase.from('customer_orders').select('order_number');
        if (companyId) {
            query = query.eq('company_id', companyId);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);

        let maxNum = 0;
        if (data && data.length > 0) {
            for (const row of data) {
                if (row.order_number) {
                    const match = row.order_number.match(/(\d+)$/);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (!isNaN(num) && num > maxNum) {
                            maxNum = num;
                        }
                    }
                }
            }
        }

        const nextNum = maxNum + 1;
        return `ORD-${String(nextNum).padStart(4, '0')}`;
    },

    createOrder: async (orderData: any) => {
        const { items, ...header } = orderData;

        // Sanitize header values (convert empty strings to null)
        const sanitizedHeader = { ...header };
        Object.keys(sanitizedHeader).forEach(f => {
            if (sanitizedHeader[f] === '') sanitizedHeader[f] = null;
        });

        if (!sanitizedHeader.order_number || !sanitizedHeader.order_number.trim()) {
            sanitizedHeader.order_number = await SalesModel.getNextNumber(sanitizedHeader.company_id);
        }

        const { data, error } = await supabase
            .from('customer_orders')
            .insert([sanitizedHeader])
            .select()
            .single();

        if (error) throw new Error(error.message);

        if (items && items.length > 0) {
            const itemsToInsert = items.map((item: any) => {
                const { value, ...rest } = item;
                const sanitizedItem = { ...rest, order_id: data.id };
                if (sanitizedItem.product_id === '') sanitizedItem.product_id = null;
                return sanitizedItem;
            });

            const { error: itemError } = await supabase
                .from('customer_order_items')
                .insert(itemsToInsert);

            if (itemError) throw new Error(itemError.message);
        }

        return data;
    },

    updateOrder: async (id: string, orderData: any) => {
        const { items, ...header } = orderData;

        // Sanitize header values (convert empty strings to null)
        const sanitizedHeader = { ...header };
        Object.keys(sanitizedHeader).forEach(f => {
            if (sanitizedHeader[f] === '') sanitizedHeader[f] = null;
        });

        // Update header
        const { error: headerError } = await supabase
            .from('customer_orders')
            .update(sanitizedHeader)
            .eq('id', id);

        if (headerError) throw new Error(headerError.message);

        // Update items (Delete and Re-insert is simplest for ACID compliance here)
        if (items) {
            await supabase.from('customer_order_items').delete().eq('order_id', id);

            if (items.length > 0) {
                const itemsToInsert = items.map((item: any) => {
                    const { value, ...rest } = item;
                    const sanitizedItem = { ...rest, order_id: id };
                    if (sanitizedItem.product_id === '') sanitizedItem.product_id = null;
                    return sanitizedItem;
                });

                const { error: itemError } = await supabase
                    .from('customer_order_items')
                    .insert(itemsToInsert);

                if (itemError) throw new Error(itemError.message);
            }
        }

        return true;
    },

    deleteOrder: async (id: string) => {
        const { error } = await supabase
            .from('customer_orders')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return true;
    }
};
