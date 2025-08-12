import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Usage:
 *  - @CurrentUser() user
 *  - @CurrentUser('id') userId
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!data || !user) return user;
    return user?.[data];
  },
);


