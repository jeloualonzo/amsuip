import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { supabase } from '@/lib/supabase';

// Mock the supabase auth methods
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockResetPassword = jest.fn();
const mockUpdateUser = jest.fn();
const mockGetSession = jest.fn();

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockImplementation(mockSignIn),
      signOut: jest.fn().mockImplementation(mockSignOut),
      resetPasswordForEmail: jest.fn().mockImplementation(mockResetPassword),
      updateUser: jest.fn().mockImplementation(mockUpdateUser),
      onAuthStateChange: jest.fn((callback) => {
        // Simulate auth state change
        callback('SIGNED_IN', { user: { id: '123', email: 'test@example.com' } });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      getSession: jest.fn().mockImplementation(mockGetSession),
    },
  },
}));

describe('AuthProvider', () => {
  const TestComponent = () => {
    return (
      <AuthProvider>
        <AuthContext.Consumer>
          {({ user, isAuthenticated, loading }) => (
            <div>
              <div data-testid="user-email">{user?.email}</div>
              <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
              <div data-testid="is-loading">{loading ? 'true' : 'false'}</div>
            </div>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('should provide initial auth state', async () => {
    render(<TestComponent />);
    
    // Initial loading state should be true
    expect(screen.getByTestId('is-loading').textContent).toBe('true');
    
    // After auth state is determined, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });
    
    // Should be authenticated after auth state change
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
  });

  it('should handle sign in', async () => {
    // Mock successful sign in
    mockSignIn.mockResolvedValueOnce({
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'test-token' },
      },
      error: null,
    });

    let signInFunction: any;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ signIn }) => {
            signInFunction = signIn;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await signInFunction('test@example.com', 'password');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle sign out', async () => {
    // Mock successful sign out
    mockSignOut.mockResolvedValueOnce({ error: null });

    let signOutFunction: any;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ signOut }) => {
            signOutFunction = signOut;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await signOutFunction();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should handle password reset', async () => {
    // Mock successful password reset
    mockResetPassword.mockResolvedValueOnce({ error: null });

    let resetPasswordFunction: any;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ resetPassword }) => {
            resetPasswordFunction = resetPassword;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await resetPasswordFunction('test@example.com');
    });

    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', {
      redirectTo: expect.stringContaining('/update-password'),
    });
  });

  it('should handle password update', async () => {
    // Mock successful password update
    mockUpdateUser.mockResolvedValueOnce({ data: { user: {} }, error: null });

    let updatePasswordFunction: any;
    
    // Mock the current user
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: '123', email: 'test@example.com' } } },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ updatePassword }) => {
            updatePasswordFunction = updatePassword;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await updatePasswordFunction('new-password');
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: 'new-password',
    });
  });

  it('should handle auth errors', async () => {
    // Mock error response
    const testError = new Error('Test error');
    mockSignIn.mockRejectedValueOnce(testError);

    let signInFunction: any;
    let errorState: any;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ signIn, error }) => {
            signInFunction = signIn;
            errorState = error;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await signInFunction('test@example.com', 'wrong-password');
    });

    expect(errorState).toBe('Test error');
  });
});
