import { render, screen, userEvent } from '@testing-library/react-native';

import { t } from '@/i18n';

import { Button } from '../Button';
import { Input } from '../Input';
import { ScoreRing } from '../ScoreRing';

describe('Button', () => {
  it('chama onPress quando está normal', async () => {
    const onPress = jest.fn();
    await render(<Button label="Começar" onPress={onPress} />);
    await userEvent.setup().press(screen.getByRole('button', { name: 'Começar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('desabilitado: não chama onPress e avisa o leitor de tela', async () => {
    const onPress = jest.fn();
    await render(<Button label="Começar" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Começar' });
    expect(button).toBeDisabled();
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('carregando: troca o texto por "Carregando" e bloqueia novos toques', async () => {
    const onPress = jest.fn();
    await render(<Button label="Começar" onPress={onPress} loading />);
    const button = screen.getByRole('button', { name: t.common.loading });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Input', () => {
  it('mostra a mensagem de erro e a usa como dica de acessibilidade', async () => {
    await render(<Input label="E-mail" value="x" error="Esse e-mail não parece certo" />);
    expect(screen.getByText('Esse e-mail não parece certo')).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail')).toHaveProp('accessibilityHint', 'Esse e-mail não parece certo');
  });

  it('sem erro, não mostra mensagem', async () => {
    await render(<Input label="E-mail" value="" />);
    expect(screen.queryByText('Esse e-mail não parece certo')).toBeNull();
  });

  it('campo de senha alterna mostrar/ocultar', async () => {
    await render(<Input label="Senha" value="12345678" password />);
    await userEvent.setup().press(screen.getByRole('button', { name: t.input.showPassword }));
    expect(screen.getByRole('button', { name: t.input.hidePassword })).toBeOnTheScreen();
  });
});

describe('ScoreRing', () => {
  it.each([
    [85, t.scoreRing.high],
    [55, t.scoreRing.mid],
    [20, t.scoreRing.low],
  ])('nota %i mostra a faixa "%s" em texto (não só na cor)', async (score, label) => {
    await render(<ScoreRing score={score} />);
    expect(screen.getByText(label)).toBeOnTheScreen();
    expect(screen.getByLabelText(t.scoreRing.a11y(score, label))).toBeOnTheScreen();
  });
});
