# Fonte Siwki

Fonte monoline (traço fino, pontas arredondadas) baseada nas letras do logotipo (s, i, w, k).
As demais letras foram desenhadas no mesmo estilo.

Arquivos (pasta `fonts/`):
- `Siwki-Light.ttf/.woff`   → peso 300, idêntico ao traço do logo (títulos grandes)
- `Siwki-Regular.ttf/.woff` → peso 400, traço um pouco mais firme (textos pequenos e botões)

Inclui: a–z, A–Z, 0–9, acentos do português (á à â ã é ê í ó ô õ ú ç e maiúsculas) e pontuação básica `. , : ; ! ? - _ + = / ( ) " '`.
Não inclui: @ # % & $ * e outros símbolos — use fallback do sistema.
Extra: o caractere U+E000 () é o "i" com o check do logo.

## Web / React / Next
Importe `siwki-font.css` e use `font-family: var(--font-siwki)`.

## React Native / Expo
```
npx expo install expo-font
```
```js
const [ok] = useFonts({ 'Siwki-Light': require('./assets/fonts/Siwki-Light.ttf'),
                       'Siwki-Regular': require('./assets/fonts/Siwki-Regular.ttf') });
<Text style={{ fontFamily: 'Siwki-Light', fontSize: 32 }}>Treine sua entrevista</Text>
```

## Flutter (pubspec.yaml)
```yaml
flutter:
  fonts:
    - family: Siwki
      fonts:
        - asset: assets/fonts/Siwki-Light.ttf
          weight: 300
        - asset: assets/fonts/Siwki-Regular.ttf
          weight: 400
```
`Text('Olá', style: TextStyle(fontFamily: 'Siwki'))`

## Android nativo / iOS
Android: coloque os .ttf em `res/font/` (nomes em minúsculas: `siwki_light.ttf`). iOS: adicione ao projeto e registre em `UIAppFonts` no Info.plist.
