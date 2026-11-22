import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    const body = {
      success: false,
      error: { message: err.message },
    };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // Zod validation errors (fallback)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: err.errors,
      },
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
};
