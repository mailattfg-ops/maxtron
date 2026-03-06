import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export const getUserTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase.from('user_types').select('*').order('name');
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch user types', error: error.message });
    }
};

export const createUserType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        const { data, error } = await supabase.from('user_types').insert([{ name, description }]).select();
        if (error) throw new Error(error.message);
        res.status(201).json({ success: true, data: data[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to create user type', error: error.message });
    }
};

export const updateUserType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const { data, error } = await supabase.from('user_types').update({ name, description }).eq('id', id).select();
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, data: data[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update user type', error: error.message });
    }
};

export const deleteUserType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('user_types').delete().eq('id', id);
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, message: 'User type deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete user type', error: error.message });
    }
};
