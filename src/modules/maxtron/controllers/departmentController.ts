import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase.from('departments').select('*');
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
    }
};
