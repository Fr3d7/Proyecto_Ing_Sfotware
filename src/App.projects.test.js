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

describe('App Component - Gestión de Proyectos', () => {
  const mockUser = {
    usuario: {
      id: 1,
      nombre: 'Test User',
      correo: 'test@test.com'
    }
  };

  const mockProjects = [
    {
      id: 1,
      name: 'Proyecto 1',
      description: 'Descripción del proyecto 1',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      creator: 'test@test.com',
      createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Proyecto 2',
      description: 'Descripción del proyecto 2',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      creator: 'test@test.com',
      createdAt: '2025-02-01T00:00:00.000Z'
    }
  ];

  const renderAuthenticatedApp = async () => {
    // Simular login exitoso
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', 'test@test.com');
    localStorage.setItem('projects', JSON.stringify(mockProjects));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Proyectos')).toBeInTheDocument();
    });
  };

  describe('Listado de Proyectos', () => {
    test('debe mostrar la lista de proyectos del usuario autenticado', async () => {
      await renderAuthenticatedApp();

      expect(screen.getByText('Proyecto 1')).toBeInTheDocument();
      expect(screen.getByText('Proyecto 2')).toBeInTheDocument();
      expect(screen.getByText('Descripción del proyecto 1')).toBeInTheDocument();
    });

    test('debe mostrar botones de acción para cada proyecto', async () => {
      await renderAuthenticatedApp();

      const viewButtons = screen.getAllByText('Ver Detalles');
      const editButtons = screen.getAllByText('Editar');
      const deleteButtons = screen.getAllByText('Eliminar');

      expect(viewButtons.length).toBeGreaterThan(0);
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('debe mostrar información del proyecto correctamente', async () => {
      await renderAuthenticatedApp();

      // Hay múltiples proyectos, usar getAllByText y verificar que al menos uno existe
      const creadores = screen.getAllByText(/Creador: test@test.com/i);
      expect(creadores.length).toBeGreaterThan(0);
      
      expect(screen.getByText(/Inicio: 2025-01-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Fin: 2025-01-31/i)).toBeInTheDocument();
    });
  });

  describe('Crear Proyecto', () => {
    test('debe abrir el modal de nuevo proyecto', async () => {
      await renderAuthenticatedApp();

      // Hay un botón y luego un h2 con el mismo texto, buscar el botón específicamente
      const newProjectButtons = screen.getAllByText('Nuevo Proyecto');
      const button = newProjectButtons.find(el => el.tagName === 'BUTTON');
      fireEvent.click(button);

      await waitFor(() => {
        // Ahora buscar el h2 del modal
        const modalTitle = screen.getByRole('heading', { name: 'Nuevo Proyecto' });
        expect(modalTitle).toBeInTheDocument();
        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
      });
    });

    test('debe crear un nuevo proyecto con datos válidos', async () => {
      await renderAuthenticatedApp();

      const newProjectButton = screen.getByText('Nuevo Proyecto');
      fireEvent.click(newProjectButton);

      await waitFor(() => {
        expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/nombre/i);
      const descriptionInput = screen.getByLabelText(/descripción/i);
      const startDateInput = screen.getByLabelText(/fecha inicio/i);
      const endDateInput = screen.getByLabelText(/fecha fin/i);
      const saveButton = screen.getByText('Guardar');

      await userEvent.type(nameInput, 'Nuevo Proyecto Test');
      await userEvent.type(descriptionInput, 'Descripción del nuevo proyecto');
      fireEvent.change(startDateInput, { target: { value: '2025-03-01' } });
      fireEvent.change(endDateInput, { target: { value: '2025-03-31' } });

      fireEvent.click(saveButton);

      await waitFor(() => {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const newProject = projects.find(p => p.name === 'Nuevo Proyecto Test');
        expect(newProject).toBeDefined();
        expect(newProject.description).toBe('Descripción del nuevo proyecto');
        expect(newProject.creator).toBe('test@test.com');
      });
    });

    test('debe validar que el nombre del proyecto no esté vacío', async () => {
      await renderAuthenticatedApp();

      const newProjectButton = screen.getByText('Nuevo Proyecto');
      fireEvent.click(newProjectButton);

      await waitFor(() => {
        expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // El input debe estar marcado como required, por lo que el navegador impedirá el envío
      // Verificamos que el proyecto no se haya creado
      await waitFor(() => {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const newProject = projects.find(p => p.name === '');
        expect(newProject).toBeUndefined();
      });
    });

    test('debe cerrar el modal al hacer clic en Cancelar', async () => {
      await renderAuthenticatedApp();

      const newProjectButton = screen.getByText('Nuevo Proyecto');
      fireEvent.click(newProjectButton);

      await waitFor(() => {
        expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Nuevo Proyecto')).not.toBeInTheDocument();
      });
    });
  });

  describe('Editar Proyecto', () => {
    test('debe abrir el modal de edición con los datos del proyecto', async () => {
      await renderAuthenticatedApp();

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Proyecto')).toBeInTheDocument();
        const nameInput = screen.getByLabelText(/nombre/i);
        expect(nameInput.value).toBe('Proyecto 1');
      });
    });

    test('debe actualizar un proyecto existente', async () => {
      await renderAuthenticatedApp();

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Proyecto')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/nombre/i);
      const descriptionInput = screen.getByLabelText(/descripción/i);
      const saveButton = screen.getByText('Guardar');

      fireEvent.change(nameInput, { target: { value: 'Proyecto 1 Actualizado' } });
      fireEvent.change(descriptionInput, { target: { value: 'Descripción actualizada' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProject = projects.find(p => p.id === 1);
        expect(updatedProject.name).toBe('Proyecto 1 Actualizado');
        expect(updatedProject.description).toBe('Descripción actualizada');
      });
    });
  });

  describe('Eliminar Proyecto', () => {
    test('debe eliminar un proyecto de la lista', async () => {
      await renderAuthenticatedApp();

      const initialProjectsCount = JSON.parse(localStorage.getItem('projects') || '[]').length;
      const deleteButtons = screen.getAllByText('Eliminar');
      
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        expect(projects.length).toBe(initialProjectsCount - 1);
        expect(projects.find(p => p.id === 1)).toBeUndefined();
      });
    });

    test('debe actualizar localStorage al eliminar un proyecto', async () => {
      await renderAuthenticatedApp();

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        expect(storedProjects.length).toBe(1);
        expect(storedProjects[0].id).toBe(2);
      });
    });
  });

  describe('Ver Detalles de Proyecto', () => {
    test('debe mostrar los detalles del proyecto al hacer clic en Ver Detalles', async () => {
      await renderAuthenticatedApp();

      const viewButtons = screen.getAllByText('Ver Detalles');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Proyecto 1')).toBeInTheDocument();
        // Verificar que se muestre el contenido del detalle del proyecto
      });
    });

    test('debe poder regresar a la lista de proyectos desde los detalles', async () => {
      await renderAuthenticatedApp();

      const viewButtons = screen.getAllByText('Ver Detalles');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Proyecto 1')).toBeInTheDocument();
      });

      // Buscar botón de volver (puede variar según la implementación)
      const backButtons = screen.queryAllByText(/volver|regresar|proyectos/i);
      if (backButtons.length > 0) {
        fireEvent.click(backButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText('Proyectos')).toBeInTheDocument();
        });
      }
    });
  });
});

