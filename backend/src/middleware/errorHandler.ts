import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  logger.error(`Error: ${message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  })

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: ApiError = new Error(`Not Found - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export class AppError extends Error implements ApiError {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
