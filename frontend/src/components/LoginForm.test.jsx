import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  test('renderiza campos de usuario e senha', () => {
    render(<LoginForm onLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Digite seu usu\u00e1rio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
  });

  test('credenciais invalidas mostram erro', async () => {
    render(<LoginForm onLogin={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('Digite seu usu\u00e1rio'), 'errado');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'errado');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/usu.rio ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  test('login admin chama onLogin com papel admin', async () => {
    const mock = jest.fn();
    render(<LoginForm onLogin={mock} />);
    await userEvent.type(screen.getByPlaceholderText('Digite seu usu\u00e1rio'), 'Admin');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'admin123');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => { expect(mock).toHaveBeenCalledWith(expect.objectContaining({ papel: 'admin' })); });
  });

  test('login vendedor chama onLogin com papel vendedor', async () => {
    const mock = jest.fn();
    render(<LoginForm onLogin={mock} />);
    await userEvent.type(screen.getByPlaceholderText('Digite seu usu\u00e1rio'), 'Vendedor');
    await userEvent.type(screen.getByPlaceholderText('Digite sua senha'), 'vend123');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => { expect(mock).toHaveBeenCalledWith(expect.objectContaining({ papel: 'vendedor' })); });
  });
});
