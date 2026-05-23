import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button component', () => {
  it('renderiza el botón con el texto correcto', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('llama a la función onClick al ser presionado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('se deshabilita correctamente', () => {
    render(<Button disabled>Click Me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('aplica la clase de variante correctamente', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    // Asumiendo que la variante danger incluye bg-danger o text-danger según CVA
    // Solo validamos que la clase contenga algo relacionado a danger, o comprobamos que se renderiza.
    expect(button).toHaveClass('bg-[var(--color-danger)]');
  });
});
