
export const PUZZLE_THEMES = [
  // Opening Pairs
  { id: 'op_mid', skills: ['opening', 'midgame'], name: "O Dominador de Espaço", flavor: "Transição perfeita da teoria para o meio-jogo..." },
  { id: 'op_end', skills: ['opening', 'endgame'], name: "O Liquidante", flavor: "Linhas teóricas que forçam trocas para finais ganhos..." },
  { id: 'op_sac', skills: ['opening', 'sacrifice'], name: "O Gambito Ousado", flavor: "Entregar material cedo por desenvolvimento..." },
  { id: 'op_def', skills: ['opening', 'defense'], name: "A Muralha de Pedra", flavor: "Estruturas ultrassólidas inquebráveis..." },
  { id: 'op_tac', skills: ['opening', 'tactics'], name: "A Cilada de Livro", flavor: "Armadilhas decoradas para pegar despreparados..." },

  // Midgame Pairs
  { id: 'mid_end', skills: ['midgame', 'endgame'], name: "A Técnica Capablanca", flavor: "Simplificar vantagem posicional para final ganho..." },
  { id: 'mid_sac', skills: ['midgame', 'sacrifice'], name: "A Tempestade Tática", flavor: "Ataques diretos ao rei no meio do tabuleiro..." },
  { id: 'mid_def', skills: ['midgame', 'defense'], name: "A Profilaxia", flavor: "Prevenir planos antes que aconteçam..." },
  { id: 'mid_tac', skills: ['midgame', 'tactics'], name: "O Golpe Combinado", flavor: "Sequências forçadas na confusão..." },

  // Endgame Pairs
  { id: 'end_sac', skills: ['endgame', 'sacrifice'], name: "A Ruptura", flavor: "Sacrificar para promover..." },
  { id: 'end_def', skills: ['endgame', 'defense'], name: "A Fortaleza", flavor: "Segurar empates em posições perdidas..." },
  { id: 'end_tac', skills: ['endgame', 'tactics'], name: "O Estudo Artístico", flavor: "Geometria mágica do tabuleiro..." },

  // Special Pairs
  { id: 'sac_def', skills: ['sacrifice', 'defense'], name: "O Desperado", flavor: "Sacrificar para forçar afogamento..." },
  { id: 'sac_tac', skills: ['sacrifice', 'tactics'], name: "O Brilhantismo", flavor: "Beleza pura e ataque..." },
  { id: 'def_tac', skills: ['defense', 'tactics'], name: "O Contra-Ataque", flavor: "Defender criando ameaça maior..." }
];
