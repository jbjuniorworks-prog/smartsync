import { render, screen } from '@testing-library/react';
import { StockCard } from './StockCard';

const item = { id:'1', aparelho:'iPhone 13', imei:'123456789012345', cliente:'Joao Silva', cpf:'12345678901', telefone:'79999999999', status:'Em estoque', preco:1500, dataCadastro:new Date().toISOString(), foto:null };
const props = { onAlterarStatus:()=>{}, onVender:()=>{}, onExcluir:()=>{}, onImprimir:()=>{}, onAtualizar:()=>{}, buscarHistorico:()=>Promise.resolve([]) };

describe('StockCard', () => {
  test('renderiza nome do aparelho', () => {
    render(<StockCard item={item} {...props} isAdmin={true} />);
    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
  });

  test('renderiza nome do cliente', () => {
    render(<StockCard item={item} {...props} isAdmin={true} />);
    expect(screen.getByText(/joao silva/i)).toBeInTheDocument();
  });

  test('exibe botoes de acao para Admin', () => {
    render(<StockCard item={item} {...props} isAdmin={true} />);
    expect(screen.getByText(/concluir|vender/i)).toBeInTheDocument();
  });

  test('oculta botoes de acao para Vendedor', () => {
    render(<StockCard item={item} {...props} isAdmin={false} />);
    expect(screen.queryByText(/concluir|vender/i)).not.toBeInTheDocument();
  });

  test('badge Concluido quando status Vendido', () => {
    render(<StockCard item={{...item, status:'Vendido'}} {...props} isAdmin={true} />);
    expect(screen.getByText(/conclu/i)).toBeInTheDocument();
  });

  test('badge Em servico quando status Em estoque', () => {
    render(<StockCard item={item} {...props} isAdmin={true} />);
    expect(screen.getByText(/em servi/i)).toBeInTheDocument();
  });
});
