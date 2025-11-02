import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock de fetch global
global.fetch = jest.fn();

// Limpiar localStorage antes de cada test
beforeEach(() => {
  localStorage.clear();
  fetch.mockClear();
});

describe('App Component - Autenticación', () => {
  describe('Login', () => {
    test('debe renderizar el formulario de login correctamente', () => {
      render(<App />);
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('contrasena')).toBeInTheDocument();
      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });

    test('debe mostrar error si el correo está vacío', async () => {
      render(<App />);
      const submitButton = screen.getByText('Entrar');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correo es obligatorio/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error si la contraseña está vacía', async () => {
      render(<App />);
      const emailInput = screen.getByPlaceholderText('Correo');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

      const submitButton = screen.getByText('Entrar');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/contraseña es obligatoria/i)).toBeInTheDocument();
      });
    });

    test('debe llamar a la API de login con los datos correctos', async () => {
      const mockResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          correo: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);

      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const submitButton = screen.getByText('Entrar');

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/Usuarios/login',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              correo: 'test@test.com',
              contrasena: 'password123'
            })
          })
        );
      });
    });

    test('debe mostrar mensaje de éxito al iniciar sesión correctamente', async () => {
      const mockResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          correo: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);

      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const submitButton = screen.getByText('Entrar');

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/inicio de sesión exitoso/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando las credenciales son incorrectas', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ mensaje: 'Correo o contraseña incorrectos' }),
      });

      render(<App />);

      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const submitButton = screen.getByText('Entrar');

      await userEvent.type(emailInput, 'wrong@test.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correo o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando no se puede conectar al servidor', async () => {
      fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      render(<App />);

      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const submitButton = screen.getByText('Entrar');

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/no se pudo conectar con el servidor/i)).toBeInTheDocument();
      });
    });

    test('debe guardar el estado de autenticación en localStorage', async () => {
      const mockResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          correo: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);

      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const submitButton = screen.getByText('Entrar');

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('isAuthenticated')).toBe('true');
        expect(localStorage.getItem('currentUser')).toBe('test@test.com');
      });
    });
  });

  describe('Registro', () => {
    test('debe cambiar al formulario de registro al hacer clic en el enlace', () => {
      render(<App />);
      const registerLink = screen.getByText(/¿No tienes cuenta?/i);
      fireEvent.click(registerLink);

      expect(screen.getByText('Registro')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirmar contrasena')).toBeInTheDocument();
      expect(screen.getByText('Registrar')).toBeInTheDocument();
    });

    test('debe mostrar error si el nombre está vacío en registro', async () => {
      render(<App />);
      const registerLink = screen.getByText(/¿No tienes cuenta?/i);
      fireEvent.click(registerLink);

      const submitButton = screen.getByText('Registrar');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nombre es obligatorio/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error si las contraseñas no coinciden', async () => {
      render(<App />);
      const registerLink = screen.getByText(/¿No tienes cuenta?/i);
      fireEvent.click(registerLink);

      const nameInput = screen.getByPlaceholderText('Nombre');
      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contrasena');
      const submitButton = screen.getByText('Registrar');

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password456');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      });
    });

    test('debe llamar a la API de registro con los datos correctos', async () => {
      const mockResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          correo: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const registerLink = screen.getByText(/¿No tienes cuenta?/i);
      fireEvent.click(registerLink);

      const nameInput = screen.getByPlaceholderText('Nombre');
      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contrasena');
      const submitButton = screen.getByText('Registrar');

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/Usuarios',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: 'Test User',
              correo: 'test@test.com',
              contrasena: 'password123'
            })
          })
        );
      });
    });

    test('debe mostrar mensaje de éxito al registrarse correctamente', async () => {
      const mockResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          correo: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const registerLink = screen.getByText(/¿No tienes cuenta?/i);
      fireEvent.click(registerLink);

      const nameInput = screen.getByPlaceholderText('Nombre');
      const emailInput = screen.getByPlaceholderText('Correo');
      const passwordInput = screen.getByPlaceholderText('contrasena');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contrasena');
      const submitButton = screen.getByText('Registrar');

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/usuario registrado exitosamente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    test('debe cerrar sesión y limpiar localStorage', async () => {
      // Simular usuario autenticado
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', 'test@test.com');
      localStorage.setItem('projects', JSON.stringify([]));

      const mockResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          correo: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);

      // Esperar a que se cargue el componente autenticado
      await waitFor(() => {
        expect(screen.getByText('Proyectos')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Cerrar Sesión');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(localStorage.getItem('isAuthenticated')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });
  });
});
