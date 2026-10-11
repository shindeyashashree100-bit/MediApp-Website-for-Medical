import type { Request, Response } from 'express';
import {
  getSettings,
  updateSettings,
} from '../services/settings.service.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';

export async function getSettingsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const settings = await getSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Failed to get settings:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_FETCH_FAILED',
        message: 'Failed to fetch store settings.',
      },
    });
  }
}

export async function updateSettingsController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = updateSettingsSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid settings data.',
        details: result.error.flatten(),
      },
    });

    return;
  }

  try {
    const settings = await updateSettings(result.data);

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Failed to update settings:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_UPDATE_FAILED',
        message: 'Failed to update store settings.',
      },
    });
  }
}