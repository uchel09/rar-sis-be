/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/model/user.model';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    if (req.method === 'OPTIONS') {
      return next();
    }

    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded; // 🔥 TYPED
      next();
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
