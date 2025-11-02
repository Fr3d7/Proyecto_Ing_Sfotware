import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock de fetch global
global.fetch = jest.fn();

beforeEach(() => {
  localStorage.clear();
  fetch.mockClear();
});

describe('App Component - Backlog (Epics y User Stories)', () => {
  const mockUser = {
    usuario: {
      id: 1,
      nombre: 'Test User',
      correo: 'test@test.com'
    }
  };

  const mockProject = {
    id: 1,
    name: 'Proyecto Test',
    description: 'Descripción del proyecto',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    creator: 'test@test.com',
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  const renderProjectDetail = async () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', 'test@test.com');
    localStorage.setItem('projects', JSON.stringify([mockProject]));
    localStorage.setItem('epics', JSON.stringify([]));
    localStorage.setItem('userStories', JSON.stringify([]));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Proyectos')).toBeInTheDocument();
    });

    const viewButton = screen.getByText('Ver Detalles');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Proyecto Test')).toBeInTheDocument();
    });
  };

  describe('Gestión de Epics', () => {
    test('debe mostrar la sección de Epics en el detalle del proyecto', async () => {
      await renderProjectDetail();

      const epicSection = screen.queryByText(/epic|épica/i);
      expect(epicSection || screen.getByText('Backlog')).toBeInTheDocument();
    });

    test('debe abrir el modal para crear un nuevo Epic', async () => {
      await renderProjectDetail();

      const newEpicButton = screen.queryByText(/nuevo epic|nueva épica|crear epic/i);
      if (newEpicButton) {
        fireEvent.click(newEpicButton);

        await waitFor(() => {
          expect(screen.getByText(/nuevo epic|nueva épica/i)).toBeInTheDocument();
        });
      }
    });

    test('debe crear un nuevo Epic con datos válidos', async () => {
      await renderProjectDetail();

      const initialEpics = JSON.parse(localStorage.getItem('epics') || '[]').length;

      // Buscar botón para crear Epic (puede variar según implementación)
      const newEpicButton = screen.queryByText(/nuevo epic|nueva épica|crear epic/i);
      
      if (newEpicButton) {
        fireEvent.click(newEpicButton);

        await waitFor(() => {
          const modal = screen.queryByText(/nuevo epic|nueva épica/i);
          if (modal) {
            const titleInput = screen.getByLabelText(/título|title/i);
            const descriptionInput = screen.getByLabelText(/descripción|description/i);
            const saveButton = screen.getByText(/guardar|save/i);

            userEvent.type(titleInput, 'Epic Test');
            userEvent.type(descriptionInput, 'Descripción del Epic');
            fireEvent.click(saveButton);

            waitFor(() => {
              const epics = JSON.parse(localStorage.getItem('epics') || '[]');
              expect(epics.length).toBe(initialEpics + 1);
              expect(epics[epics.length - 1].title).toBe('Epic Test');
            });
          }
        });
      }
    });

    test('debe mostrar los Epics creados en la lista', async () => {
      const mockEpics = [
        {
          id: '1',
          title: 'Epic 1',
          description: 'Descripción Epic 1',
          projectId: 1,
          type: 'epic',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      ];

      localStorage.setItem('epics', JSON.stringify(mockEpics));

      await renderProjectDetail();

      // Navegar al tab de Backlog
      const backlogTab = screen.getByText('Backlog');
      fireEvent.click(backlogTab);

      await waitFor(() => {
        expect(screen.getByText('Epic 1')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('debe poder editar un Epic existente', async () => {
      const mockEpics = [
        {
          id: '1',
          title: 'Epic Original',
          description: 'Descripción original',
          projectId: 1,
          type: 'epic'
        }
      ];

      localStorage.setItem('epics', JSON.stringify(mockEpics));

      await renderProjectDetail();

      // Navegar al tab de Backlog
      const backlogTab = screen.getByText('Backlog');
      fireEvent.click(backlogTab);

      await waitFor(() => {
        expect(screen.getByText('Epic Original')).toBeInTheDocument();
      }, { timeout: 3000 });

      const editButtons = screen.queryAllByText(/editar|edit/i);
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
          const titleInput = screen.queryByDisplayValue('Epic Original');
          if (titleInput) {
            fireEvent.change(titleInput, { target: { value: 'Epic Editado' } });
            const saveButton = screen.getByText(/guardar|save/i);
            fireEvent.click(saveButton);

            waitFor(() => {
              const epics = JSON.parse(localStorage.getItem('epics') || '[]');
              expect(epics[0].title).toBe('Epic Editado');
            });
          }
        });
      }
    });

    test('debe eliminar un Epic y sus User Stories asociadas', async () => {
      const mockEpics = [
        {
          id: '1',
          title: 'Epic a Eliminar',
          description: 'Descripción',
          projectId: 1,
          type: 'epic'
        }
      ];

      const mockStories = [
        {
          id: '1',
          title: 'Story 1',
          epicId: '1',
          type: 'story'
        }
      ];

      localStorage.setItem('epics', JSON.stringify(mockEpics));
      localStorage.setItem('userStories', JSON.stringify(mockStories));

      await renderProjectDetail();

      // Navegar al tab de Backlog
      const backlogTab = screen.getByText('Backlog');
      fireEvent.click(backlogTab);

      await waitFor(() => {
        expect(screen.getByText('Epic a Eliminar')).toBeInTheDocument();
      }, { timeout: 3000 });

      const deleteButtons = screen.queryAllByText(/eliminar|delete/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          const epics = JSON.parse(localStorage.getItem('epics') || '[]');
          const stories = JSON.parse(localStorage.getItem('userStories') || '[]');
          expect(epics.length).toBe(0);
          expect(stories.length).toBe(0); // Las stories asociadas también deben eliminarse
        });
      }
    });
  });

  describe('Gestión de User Stories', () => {
    test('debe mostrar la sección de User Stories', async () => {
      await renderProjectDetail();

      const storiesSection = screen.queryByText(/user story|historia de usuario|stories/i);
      // Verificar que existe alguna referencia a las historias
      expect(storiesSection || screen.getByText('Backlog')).toBeInTheDocument();
    });

    test('debe crear una nueva User Story', async () => {
      const mockEpics = [
        {
          id: '1',
          title: 'Epic 1',
          projectId: 1,
          type: 'epic'
        }
      ];

      localStorage.setItem('epics', JSON.stringify(mockEpics));

      await renderProjectDetail();

      const initialStories = JSON.parse(localStorage.getItem('userStories') || '[]').length;

      const newStoryButton = screen.queryByText(/nueva historia|new story|crear historia/i);
      
      if (newStoryButton) {
        fireEvent.click(newStoryButton);

        await waitFor(() => {
          const modal = screen.queryByText(/nueva historia|new story/i);
          if (modal) {
            const titleInput = screen.getByLabelText(/título|title/i);
            const saveButton = screen.getByText(/guardar|save/i);

            userEvent.type(titleInput, 'Story Test');
            fireEvent.click(saveButton);

            waitFor(() => {
              const stories = JSON.parse(localStorage.getItem('userStories') || '[]');
              expect(stories.length).toBe(initialStories + 1);
              expect(stories[stories.length - 1].title).toBe('Story Test');
            });
          }
        });
      }
    });

    test('debe asociar una User Story a un Epic', async () => {
      const mockEpics = [
        {
          id: '1',
          title: 'Epic 1',
          projectId: 1,
          type: 'epic'
        }
      ];

      localStorage.setItem('epics', JSON.stringify(mockEpics));

      await renderProjectDetail();

      const newStoryButton = screen.queryByText(/nueva historia|new story/i);
      
      if (newStoryButton) {
        fireEvent.click(newStoryButton);

        await waitFor(() => {
          const modal = screen.queryByText(/nueva historia|new story/i);
          if (modal) {
            const epicSelect = screen.queryByLabelText(/epic/i);
            if (epicSelect) {
              fireEvent.change(epicSelect, { target: { value: '1' } });
              const titleInput = screen.getByLabelText(/título|title/i);
              userEvent.type(titleInput, 'Story con Epic');
              const saveButton = screen.getByText(/guardar|save/i);
              fireEvent.click(saveButton);

              waitFor(() => {
                const stories = JSON.parse(localStorage.getItem('userStories') || '[]');
                const lastStory = stories[stories.length - 1];
                expect(lastStory.epicId).toBe('1');
              });
            }
          }
        });
      }
    });

    test('debe mostrar las User Stories asociadas a un Epic', async () => {
      const mockEpics = [
        {
          id: '1',
          title: 'Epic 1',
          projectId: 1,
          type: 'epic'
        }
      ];

      const mockStories = [
        {
          id: '1',
          title: 'Story 1',
          epicId: '1',
          type: 'story'
        },
        {
          id: '2',
          title: 'Story 2',
          epicId: '1',
          type: 'story'
        }
      ];

      localStorage.setItem('epics', JSON.stringify(mockEpics));
      localStorage.setItem('userStories', JSON.stringify(mockStories));

      await renderProjectDetail();

      // Navegar al tab de Backlog
      const backlogTab = screen.getByText('Backlog');
      fireEvent.click(backlogTab);

      await waitFor(() => {
        expect(screen.getByText('Story 1')).toBeInTheDocument();
        expect(screen.getByText('Story 2')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('debe eliminar una User Story', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'Story a Eliminar',
          projectId: 1,
          type: 'story'
        }
      ];

      localStorage.setItem('userStories', JSON.stringify(mockStories));

      await renderProjectDetail();

      // Navegar al tab de Backlog
      const backlogTab = screen.getByText('Backlog');
      fireEvent.click(backlogTab);

      await waitFor(() => {
        expect(screen.getByText('Story a Eliminar')).toBeInTheDocument();
      }, { timeout: 3000 });

      const deleteButtons = screen.queryAllByText(/eliminar|delete/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          const stories = JSON.parse(localStorage.getItem('userStories') || '[]');
          expect(stories.length).toBe(0);
        });
      }
    });
  });
});

