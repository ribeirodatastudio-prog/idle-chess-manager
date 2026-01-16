export const CHESS_POSITIONS = {
  Opening: {
    Even: [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Start
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', // Sicilian
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', // Open Game
      'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', // Indian Game
      'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', // Queen's Gambit Declined
      'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 3 3', // Ruy Lopez
      'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2', // Queen's Pawn
      'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', // Nimzo-Indian
      'rn1qkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', // QG
      'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', // Caro-Kann
      'rnbqkbnr/ppp1pppp/8/8/3pP3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2' // Tennison Gambit
    ],
    Winning: [
      'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 3 3', // Scholar's Mate Threat
      'r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4', // Scholar's Mate Delivered (Game Over but valid)
      'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', // Italian Game (Good for White)
      'rnbqk2r/ppp2ppp/3p1n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5', // Solid Development
      'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5P2/PPPP2PP/RNBQKBNR w KQkq - 0 3', // Damiano Defense (Bad for Black)
      'r2qkbnr/ppp2ppp/2np4/4N3/2B1P1b1/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 5', // Legal's Trap Setup
      'rnb1kbnr/ppp2ppp/8/3q4/3P1p2/8/PPP1N1PP/RNBQKB1R w KQkq - 0 6', // Black weak king
      'rnbqk1nr/pppp1ppp/8/8/1b1PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 4' // White Center Control
    ],
    Losing: [
      'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', // Fool's Mate Setup
      'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3', // Fool's Mate Delivered
      'rnbqkbnr/ppppp2p/8/5pp1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', // Weak White King
      'rnbqk2r/pppp1ppp/5n2/4p3/1bB1P3/2P5/PP1P1PPP/RNBQK1NR b KQkq - 0 4', // White slightly passive
      'rnbqkbnr/pppp1ppp/8/8/4P3/3p4/PPP2PPP/RNBQKBNR w KQkq - 0 4', // Lost a pawn early
      'rn1qkbnr/ppp1pppp/8/5b2/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 4', // Black active
      'rnbqk1nr/pppp1ppp/8/4p3/1b1PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3' // Check on White
    ]
  },
  Midgame: {
    Even: [
      'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQ - 3 9', // Sicilian Dragon
      'r4rk1/1pp1qppp/p1np1n2/4p3/2B1P1b1/2NPPN2/PPP3PP/R2Q1RK1 w - - 0 11', // Giuoco Piano
      '2rq1rk1/pb1nbppp/1p2pn2/2pp4/2PP4/1P3NP1/PB1NPPBP/2RQ1RK1 w - - 1 11', // QID
      'r2q1rk1/ppp1bppp/2n2n2/3p4/3P2b1/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 5 9', // Orthodox
      'r3k2r/ppqn1ppp/2pbpn2/3p4/2PP4/2N1PN2/PPQ2PPP/R1B2RK1 w kq - 4 10', // Slav
      'r1bq1rk1/pp1n1pbp/2p2np1/4p3/4P3/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 10', // KID
      '2rr2k1/pp2bppp/1qn1pn2/3p4/3P1B2/2P2N1P/PPQ2PP1/R3RNK1 b - - 6 15', // Caro-Kann Mid
      'r4rk1/ppq2pbp/2n1bnp1/2pp4/8/1PN1PN2/PB2BPPP/R2Q1RK1 w - - 1 12' // English
    ],
    Winning: [
      'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9', // Dragon White Attack
      'r4rk1/pp3ppp/2n5/3q4/3P4/5N2/PP3PPP/R2Q1RK1 w - - 0 15', // White solid, passed pawn potential
      '2r2rk1/pp3ppp/1q2pn2/3p4/3P4/P1N5/1PP1QPPP/2R2RK1 w - - 0 16', // White active
      'r1b2rk1/pp3ppp/2n1p3/q7/3P4/2PB1N2/P2Q1PPP/R4RK1 w - - 3 14', // White attacking chances
      'r4rk1/1p3ppp/p2p4/3Np1q1/4P3/8/PPP2PPP/R2Q1RK1 w - - 0 16', // Knight outpost
      'r1b2rk1/ppp2ppp/2n5/3qp3/8/3P1N2/PPP2PPP/R2QKB1R w KQ - 0 9', // White solid structure
      'r4rk1/pp1n1ppp/2p5/3pP3/3P1P1q/2N4P/PP2Q1P1/R4RK1 w - - 1 18' // Space advantage
    ],
    Losing: [
      'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQ - 3 9', // Dragon Black Counter
      'r2r2k1/pp3ppp/2n2n2/2q5/3p4/3B1N2/PPP2PPP/R2Q1RK1 b - - 0 15', // Black passed pawn
      'r4rk1/pp3ppp/2n5/3q4/3P4/5N2/PP3PPP/R2Q1RK1 b - - 0 15', // Black active pieces
      'r1b2rk1/pp3ppp/2n1p3/q7/3P4/2PB1N2/P2Q1PPP/R4RK1 b - - 3 14', // Black pressure
      '2kr3r/ppp2ppp/2n5/3q4/3P4/5N2/PP3PPP/R2Q1RK1 b - - 1 14', // Black castled long, attack
      'rnb2rk1/ppp2ppp/8/3q4/3P4/5N2/PPP2PPP/R2Q1RK1 b - - 0 10', // Black piece activity
      'r4rk1/1pp2ppp/p1np4/4p3/2B1P1b1/2NPPN2/PPP3PP/R2Q1RK1 b - - 0 11' // Black pinning
    ]
  },
  Endgame: {
    Even: [
      '8/8/4k3/8/8/3P4/4K3/8 w - - 0 1', // K+P vs K
      '8/5k2/8/8/8/4K3/4P3/8 w - - 0 1', // K+P vs K
      '8/8/8/8/3k4/8/3K4/8 w - - 0 1', // Opposition
      '8/2p5/3k4/8/8/3K4/2P5/8 w - - 0 1', // Pawn ending
      '8/8/1r6/5k2/8/5K2/1R6/8 w - - 0 1', // Rook ending
      '8/8/8/5b2/3k4/8/3K4/5B2 w - - 0 1', // Bishop ending
      '8/8/8/5n2/3k4/8/3K4/5N2 w - - 0 1', // Knight ending
      '8/8/1p6/1P6/5k2/5p2/5K2/8 w - - 0 1' // Pawn deadlock
    ],
    Winning: [
      '8/8/8/8/8/4k3/4p3/4K3 b - - 0 1', // Promote soon
      '8/8/8/8/P7/8/k7/7K w - - 0 1', // Outside passed pawn
      '8/8/8/8/8/8/Q7/K1k5 w - - 0 1', // Queen vs King
      '8/8/8/8/8/8/R7/K1k5 w - - 0 1', // Rook vs King
      '8/8/4k3/8/8/3P4/4K3/5Q2 w - - 0 1', // Q+P vs K
      '8/8/4k3/8/5P2/3P4/4K3/8 w - - 0 1', // 2P vs K
      '8/8/8/6P1/5K2/8/7k/8 w - - 0 1', // Pawn race win
      '8/8/8/5R2/8/4k3/8/4K3 w - - 0 1' // Cutting off king
    ],
    Losing: [
      '8/8/8/8/8/4K3/4P3/4k3 b - - 0 1', // Opponent Winning
      'K7/7k/8/p7/8/8/8/8 b - - 0 1', // Black outside passed pawn
      '5k1K/7Q/8/8/8/8/8/8 b - - 0 1', // Black Queen vs White King
      '5k1K/7R/8/8/8/8/8/8 b - - 0 1', // Black Rook vs White King
      '8/3k4/3p4/8/3K4/8/8/8 b - - 0 1', // Black pawn up
      '8/8/8/2k5/1p6/1K6/8/8 b - - 0 1', // Black pushing
      '8/5k2/8/8/2r5/4K3/8/8 b - - 0 1', // Black Rook vs King
      '8/8/5k2/5p2/5K2/8/8/8 b - - 0 1' // Black pawn advantage
    ]
  }
};
