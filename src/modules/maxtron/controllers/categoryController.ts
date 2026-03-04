import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

// Get all employee categories
export const getCategories = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('employee_categories')
            .select('*')
            .order('category_name', { ascending: true });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
