import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from '../role.guard';
import { UserRole } from '../../lib/supabase';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should allow access when user has required role', () => {
      const mockRequest = {
        user: {
          profile: {
            role: UserRole.BUYER,
          },
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.BUYER]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const mockRequest = {
        user: {
          profile: {
            role: UserRole.SELLER,
          },
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.BUYER, UserRole.SELLER]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const mockRequest = {
        user: {
          profile: {
            role: UserRole.BUYER,
          },
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.SELLER]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );

      try {
        guard.canActivate(mockExecutionContext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe(
          'Access denied. Required roles: SELLER',
        );
      }
    });

    it('should throw ForbiddenException with multiple roles in message', () => {
      const mockRequest = {
        user: {
          profile: {
            role: UserRole.BUYER,
          },
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.SELLER, 'ADMIN']);

      try {
        guard.canActivate(mockExecutionContext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe(
          'Access denied. Required roles: SELLER, ADMIN',
        );
      }
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      const mockRequest = {
        user: undefined,
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.BUYER]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );

      try {
        guard.canActivate(mockExecutionContext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe(
          'User not authenticated',
        );
      }
    });

    it('should throw ForbiddenException when user has no profile', () => {
      const mockRequest = {
        user: {
          profile: undefined,
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.BUYER]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );

      try {
        guard.canActivate(mockExecutionContext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe(
          'User not authenticated',
        );
      }
    });

    it('should throw ForbiddenException when user object exists but is null', () => {
      const mockRequest = {
        user: null,
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.BUYER]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should handle empty roles array by checking it as falsy', () => {
      const mockRequest = {
        user: {
          profile: {
            role: UserRole.BUYER,
          },
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      // Empty array is truthy in JavaScript, so it will check roles
      // Since no role matches (empty array), it will throw ForbiddenException
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should correctly check role when profile has null role', () => {
      const mockRequest = {
        user: {
          profile: {
            role: null,
          },
        },
      };

      (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => mockRequest,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.BUYER]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should use metadata from both handler and class', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();

      (mockExecutionContext.getHandler as jest.Mock).mockReturnValue(
        mockHandler,
      );
      (mockExecutionContext.getClass as jest.Mock).mockReturnValue(mockClass);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockHandler,
        mockClass,
      ]);
    });
  });
});
