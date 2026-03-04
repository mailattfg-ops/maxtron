import { Request, Response } from 'express';
import { AttendanceModel } from '../models/attendanceModel';

export const getAllAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { company_id } = req.query;
        const attendance = await AttendanceModel.getAll(company_id as string);
        res.status(200).json({ success: true, count: attendance.length, data: attendance });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
    }
};

export const getAttendanceByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.params;
        const { company_id } = req.query;
        const attendance = await AttendanceModel.getByDate(date as string, company_id as string);
        res.status(200).json({ success: true, count: attendance.length, data: attendance });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch attendance for date', error: error.message });
    }
};

export const createAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const newEntry = await AttendanceModel.create(req.body);
        res.status(201).json({ success: true, data: newEntry });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to create attendance entry', error: error.message });
    }
};

export const updateAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedEntry = await AttendanceModel.update(id as string, req.body);
        if (!updatedEntry) {
            res.status(404).json({ success: false, message: 'Attendance record not found' });
            return;
        }
        res.status(200).json({ success: true, data: updatedEntry });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update attendance record', error: error.message });
    }
};

export const deleteAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await AttendanceModel.delete(id as string);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Attendance record not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Attendance record deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete attendance record', error: error.message });
    }
};
