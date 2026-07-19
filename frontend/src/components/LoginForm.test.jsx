import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { login } from '../api';

jest.mock('../api');

describe('LoginForm', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renderiza campos de usuario e senha', () => {
    render(<LoginForm onLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Digite seu usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
  });

  test('credenciais invalidas mostram erro', async () => {
    login.mockRejectedValueOnce(new Error('Usuário ou senha incorretos'));
    render(<LoginForm onLogin={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('Digite seu usuário'), 'errado');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'errado');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/usu.rio ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  test('login admin chama onLogin com papel admin', async () => {
    login.mockResolvedValueOnce({ id: 1, nome: 'Admin', papel: 'admin' });
    const mock = jest.fn();
    render(<LoginForm onLogin={mock} />);
    await userEvent.type(screen.getByPlaceholderText('Digite seu usuário'), 'Admin');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'admin123');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => { expect(mock).toHaveBeenCalledWith(expect.objectContaining({ papel: 'admin' })); });
    expect(login).toHaveBeenCalledWith('Admin', 'admin123');
  });

  test('login vendedor chama onLogin com papel vendedor', async () => {
    login.mockResolvedValueOnce({ id: 2, nome: 'Vendedor', papel: 'vendedor' });
    const mock = jest.fn();
    render(<LoginForm onLogin={mock} />);
    await userEvent.type(screen.getByPlaceholderText('Digite seu usuário'), 'Vendedor');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'vend123');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => { expect(mock).toHaveBeenCalledWith(expect.objectContaining({ papel: 'vendedor' })); });
  });
});
