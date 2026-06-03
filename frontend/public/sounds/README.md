# Efeitos sonoros (BloodCrown)

Solte aqui os arquivos de áudio com **exatamente** estes nomes. Enquanto não
existirem, o app funciona normalmente — só não toca nada (falha em silêncio).
O mapeamento vive em [`frontend/src/lib/sound.ts`](../../src/lib/sound.ts)
(`SOUND_MANIFEST`).

| Arquivo        | Quando toca                                                        |
|----------------|-------------------------------------------------------------------|
| `crit.mp3`     | Crítico natural (nat 20) numa rolagem de atributo/perícia.        |
| `heavy.mp3`    | Golpe pesado (dano acima de metade do máximo possível).           |
| `dice.mp3`     | Qualquer outra rolagem (atributo/perícia/dano), ao revelar.       |
| `levelup.mp3`  | Subir de nível.                                                   |
| `ability.mp3`  | Ativar/desativar uma habilidade.                                  |
| `turn.mp3`     | Passar o turno.                                                   |
| `rest.mp3`     | Descanso longo concluído.                                         |
| `item.mp3`     | Usar um item/poção.                                               |

## Dicas

- **Formato:** `.mp3` (amplo suporte nos browsers). Se preferir `.ogg`/`.wav`,
  ajuste a extensão no `SOUND_MANIFEST`.
- **Duração:** efeitos curtos (~0,2–1,5s). `levelup`/`rest` podem ser um pouco
  mais longos (fanfarra).
- **Volume:** normalize os arquivos num nível parecido — o volume global é
  controlado pelo toggle no header (persistido em `localStorage` como `bc_sound`).
- O som começa **ligado** em volume 0,5 por padrão; o usuário pode silenciar ou
  ajustar pelo ícone de alto-falante no cabeçalho da ficha.

## Fontes CC0 sugeridas (livres pra uso comercial, sem atribuição)

- https://pixabay.com/sound-effects/ (busque "dice", "level up", "magic", "heal")
- https://freesound.org/ (filtre por licença **Creative Commons 0**)
- https://kenney.nl/assets?q=audio (packs CC0 de UI/RPG)
