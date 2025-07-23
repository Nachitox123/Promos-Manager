import { Request, Response } from 'express';
import Promotion, { IPromotion } from '../models/Promotion';
import { ApiResponse, QueryParams, Currency, PromotionStatus } from '../types';

export class PromotionController {
  // Get all promotions
  static async getPromotions(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        status,
        submittedBy 
      } = req.query as QueryParams & { status?: string; submittedBy?: string };
      
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Build filter object
      const filter: any = {};
      if (status) filter.status = status;
      if (submittedBy) filter.submittedBy = submittedBy;

      const promotions = await Promotion.find(filter)
        .populate('submittedBy', '_id')  // Changing it to '_id' from 'name email'
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Promotion.countDocuments(filter);

      const response: ApiResponse = {
        success: true,
        data: {
          promotions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: 'Promotions retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve promotions',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  }

  // Get promotion by ID
  static async getPromotionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findById(id).populate('submittedBy', '_id'); // Changing it to '_id' from 'name email'

      if (!promotion) {
        const response: ApiResponse = {
          success: false,
          message: 'Promotion not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: promotion,
        message: 'Promotion retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve promotion',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  }

  // Create new promotion
  static async createPromotion(req: Request, res: Response): Promise<void> {
    try {
      const promotionData: Partial<IPromotion> = req.body;
      const promotion = new Promotion(promotionData);
      const savedPromotion = await promotion.save();

      // Populate the submittedBy field for response
      await savedPromotion.populate('submittedBy', '_id');  // Changing it to '_id' from 'name email'

      const response: ApiResponse = {
        success: true,
        data: savedPromotion,
        message: 'Promotion created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create promotion',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(400).json(response);
    }
  }

  // Update promotion
  static async updatePromotion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<IPromotion> = req.body;

      const promotion = await Promotion.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('submittedBy', '_id'); // Changing it to '_id' from 'name email'

      if (!promotion) {
        const response: ApiResponse = {
          success: false,
          message: 'Promotion not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: promotion,
        message: 'Promotion updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update promotion',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(400).json(response);
    }
  }

  // Delete promotion
  static async deletePromotion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findByIdAndDelete(id);

      if (!promotion) {
        const response: ApiResponse = {
          success: false,
          message: 'Promotion not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Promotion deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete promotion',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  }

  // Get active promotions
  static async getActivePromotions(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const activePromotions = await Promotion.find({
        status: PromotionStatus.APPROVED,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('submittedBy', '_id');    // Changing it to '_id' from 'name email'

      const response: ApiResponse = {
        success: true,
        data: activePromotions,
        message: 'Active promotions retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve active promotions',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  }

  // Update promotion status
  static async updatePromotionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;

      if (!Object.values(PromotionStatus).includes(status)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid status provided',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: any = { status };
      if (comment) updateData.comment = comment;

      const promotion = await Promotion.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('submittedBy', '_id'); // Changing it to '_id' from 'name email'

      if (!promotion) {
        const response: ApiResponse = {
          success: false,
          message: 'Promotion not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: promotion,
        message: 'Promotion status updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update promotion status',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(400).json(response);
    }
  }

  // Get promotions by user
  static async getPromotionsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query as QueryParams;
      
      const skip = (page - 1) * limit;

      const promotions = await Promotion.find({ submittedBy: userId })
        .populate('submittedBy', '_id') // Changing it to '_id' from 'name email'
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Promotion.countDocuments({ submittedBy: userId });

      const response: ApiResponse = {
        success: true,
        data: {
          promotions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: 'User promotions retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve user promotions',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  }
}