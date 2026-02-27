// Claude Garden — All Claude variants
// New sprite style: 6 lines × 13 chars (box-drawing characters)
//
// Base template:
//    [hat/ears]        line 0: accessory (or 13 spaces)
//  ┏━━━━━━━━━┓        line 1: head top
// ┏┛  eyes    ┗┓      line 2: eyes
// ┗┓  mouth   ┏┛      line 3: mouth
//  ┗┳┳┳┳━┳┳┳┳┛        line 4: body bottom
//   ┗┛┗┛ ┗┛┗┛         line 5: feet
//
// mini (garden, 3 lines × 5 chars):
//    ▐ ▌
//   ▐· ·▌
//    ▘ ▝

export const RARITY_NAMES = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
export const RARITY_STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

// ANSI colors per rarity
export const RARITY_COLORS = {
  1: '\x1b[37m',        // white
  2: '\x1b[32m',        // green
  3: '\x1b[36m',        // cyan
  4: '\x1b[35m',        // magenta
  5: '\x1b[33m',        // yellow/gold
};

// Duplicate bonus coins per rarity
export const DUP_BONUS = [0, 2, 5, 15, 50, 200];

export const ALL_CLAUDES = [
  // ═══════════════════════════════════
  // ★ Common (8)
  // ═══════════════════════════════════
  {
    id: 'normal', name: 'Normal', rarity: 1,
    desc: 'Just your everyday Claude.',
    mini: [' ▐ ▌ ', '▐· ·▌', ' ▘ ▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ▖   ▗  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'sleepy', name: 'Sleepy', rarity: 1,
    desc: 'Zzz... five more minutes.',
    mini: [' ▐ ▌ ', '▐- -▌', ' ▘ ▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ▁   ▁  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'happy', name: 'Happy', rarity: 1,
    desc: 'Having a great day!',
    mini: [' ▐ ▌ ', '▐^ ^▌', ' ▘ ▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ^   ^  ┗┓',
      '┗┓    u    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'thinker', name: 'Thinker', rarity: 1,
    desc: 'Deep in thought...',
    mini: [' ▐ ▌?', '▐· ·▌', ' ▘~▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓?',
      '┏┛  ▖   ▗  ┗┓',
      '┗┓    ~    ┏┛',
      '?┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛ ?',
    ],
  },
  {
    id: 'shy', name: 'Shy', rarity: 1,
    desc: "D-don't look at me!",
    mini: [' ▐ ▌ ', '▐>.<▌', ' ▘.▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  >   <  ┗┓',
      '┗┓//  ·  //┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'wink', name: 'Wink', rarity: 1,
    desc: '*wink*',
    mini: [' ▐ ▌ ', '▐~ ·▌', ' ▘ ▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛* _   ▗  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'surprised', name: 'Surprised', rarity: 1,
    desc: 'Whoa, what was that?!',
    mini: [' ▐!▌ ', '▐O O▌', ' ▘ ▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━!┓ ',
      '┏┛  O   O  ┗┓',
      '┗┓    o    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'chill', name: 'Chill', rarity: 1,
    desc: 'No worries, mate.',
    mini: [' ▐ ▌ ', '▐- ·▌', ' ▘  ▝'],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ▁   ▗  ┗┓',
      '┗┓    ~    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★ Uncommon (8)
  // ═══════════════════════════════════
  {
    id: 'cat', name: 'Cat', rarity: 2,
    desc: 'Meow~ Purrs on compile.',
    mini: [' ▲ ▲ ', '▐=w=▌', ' ▘ ~ '],
    sprite: [
      '   ◢◣   ◢◣   ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ▁   ▁  ┗┓',
      '┗┓ =  w  = ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛~',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'pirate', name: 'Pirate', rarity: 2,
    desc: "Arr! Where's me code?",
    mini: ['_▐ ▌ ', '▐· x▌', ' ▘ ▝ '],
    sprite: [
      '   ▁▟███▙▁   ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ▖   X  ┗┓',
      '┗┓    =    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'chef', name: 'Chef', rarity: 2,
    desc: 'Cooking up some code.',
    mini: [' ▀▀▀ ', '▐u u▌', ' ▘ ▝ '],
    sprite: [
      '   ▜█▜█▛█▛   ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  u   u  ┗┓',
      '┗┓    -    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'dj', name: 'DJ', rarity: 2,
    desc: 'Droppin sick beats.',
    mini: ['d▐ ▌b', '▐~ ~▌', ' ▘ ▝ '],
    sprite: [
      '┏━━━━━━━━━━━┓',
      '█┏━━━━━━━━━┓█',
      '┏┛  ~   ~  ┗┓',
      '┗┓    V    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'nerd', name: 'Nerd', rarity: 2,
    desc: "Well, actually...",
    mini: [' ▐ ▌ ', '▐# #▌', ' ▘ ▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  #   #  ┗┓',
      '┗┓   ---   ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'grumpy', name: 'Grumpy', rarity: 2,
    desc: 'Everything is broken.',
    mini: [' ▐ ▌ ', '▐> <▌', ' ▘_▝ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  >   <  ┗┓',
      '┗┓    _    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'royal', name: 'Royal', rarity: 2,
    desc: 'Your Majesty!',
    mini: ['w▐ ▌w', '▐o O▌', ' ▘ ▝ '],
    sprite: [
      '    ◣◢◣◢◣◢    ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  o   O  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'zombie', name: 'Zombie', rarity: 2,
    desc: 'Undead and coding...',
    mini: [' ▐ ▌ ', '▐x x▌', ' ▖ ▗ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━#━┓ ',
      '┏┛  x   x  ┗┓',
      '┗┓#   ▀▜   ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★★ Rare (6)
  // ═══════════════════════════════════
  {
    id: 'ninja', name: 'Ninja', rarity: 3,
    desc: 'Silent but deadly.',
    mini: [' ▄▄▄ ', '▐-@-▌', ' ▚ ▞ '],
    sprite: [
      '             ',
      ' ┏▅▅▅▅▅▅▅▅▅┓<',
      '┏┛  ▁ @ ▁  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'wizard', name: 'Wizard', rarity: 3,
    desc: 'Casting code spells!',
    mini: ['~▐ ▌~', '▐* *▌', ' ▘ ▝ '],
    sprite: [
      '     ▁▟▙▁    ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  *   *  ┗┓',
      '┗┓    +    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'astro', name: 'Astro', rarity: 3,
    desc: 'To the stars!',
    mini: ['(▐ ▌)', '▐· ·▌', ' ▘ ▝ '],
    sprite: [
      '    ▁▁▁▁▁    ',
      ' ┏(━━━━━━━)┓ ',
      '┏┛  ▖   ▗  ┗┓',
      '┗┓    ▽    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'samurai', name: 'Samurai', rarity: 3,
    desc: 'The way of code.',
    mini: ['━▐ ▌━', '▐= =▌', ' ▘ ▝ '],
    sprite: [
      '  ━━━━━━━━━  ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  =   =  ┗┓',
      '┗┓    ▁    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'ghost', name: 'Ghost', rarity: 3,
    desc: 'Boo! ...can you see me?',
    mini: [' ▐ ▌ ', '▐· ·▌', ' ~~~ '],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      ' ┃  ▖   ▗  ┃ ',
      ' ┃         ┃ ',
      ' ┗~~~~~~~~~┛ ',
      '             ',
    ],
  },
  {
    id: 'pixel', name: 'Pixel', rarity: 3,
    desc: '8-bit vibes.',
    mini: [' █ █ ', '██ ██', ' █ █ '],
    sprite: [
      '  ██     ██  ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  █   █  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★★★ Epic (4)
  // ═══════════════════════════════════
  {
    id: 'dragon', name: 'Dragon', rarity: 4,
    desc: 'Breathes fire and code.',
    mini: ['w▐ ▌w', '▐O O▌', ' ▘M▝ '],
    sprite: [
      '   w◢   ◣w   ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  O   O  ┗┓',
      '┗┓    M    ┏┛',
      'W┗┳┳┳┳━┳┳┳┳┛W',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'mecha', name: 'Mecha', rarity: 4,
    desc: 'Fully armored.',
    mini: ['|▐ ▌|', '[# #]', '=▘ ▝='],
    sprite: [
      '   |▐   ▌|   ',
      ' ╔═════════╗ ',
      '╔╝  #   #  ╚╗',
      '╚╗         ╔╝',
      ' ╚╦╦╦╦═╦╦╦╦╝ ',
      ' =╚╝╚╝ ╚╝╚╝= ',
    ],
  },
  {
    id: 'phoenix', name: 'Phoenix', rarity: 4,
    desc: 'Rises from every crash.',
    mini: ['~▐ ▌~', '▐^ ^▌', '~▘ ▝~'],
    sprite: [
      '  ~╲▁▁▁▁▁╱~  ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ^   ^  ┗┓',
      '┗┓    v    ┏┛',
      '~┗┳┳┳┳━┳┳┳┳┛~',
      ' ~┗┛┗┛ ┗┛┗┛~ ',
    ],
  },
  {
    id: 'galaxy', name: 'Galaxy', rarity: 4,
    desc: 'Made of stardust.',
    mini: ['*▐ ▌*', '▐@ @▌', '*▘ ▝*'],
    sprite: [
      '          *  ',
      '*┏━━━━━━━━━┓ ',
      '┏┛  @   @  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★★★★ Legendary (3)
  // ═══════════════════════════════════
  {
    id: 'opus', name: 'Opus', rarity: 5,
    desc: 'The ultimate form.',
    mini: ['*▐ ▌*', '{◆ ◆}', '<▘ ▝>'],
    sprite: [
      '  *  ▁▁▁  *  ',
      '*┏━━━━━━━━━┓*',
      '┏┛  ◆   ◆  ┗┓',
      '┗┓    ━    ┏┛',
      '*┗┳┳┳┳━┳┳┳┳┛*',
      ' *┗┛┗┛ ┗┛┗┛* ',
    ],
  },
  {
    id: 'rainbow', name: 'Rainbow', rarity: 5,
    desc: 'All colors at once.',
    mini: ['~▐ ▌~', '▐o~o▌', ' ▘ ▝ '],
    sprite: [
      ' ~~ ~~~~~ ~~ ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  o   o  ┗┓',
      '┗┓    ~    ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
  {
    id: 'mystery', name: '???', rarity: 5,
    desc: 'Nobody knows what this is.',
    mini: ['?▐ ▌?', '▐? ?▌', '?▘ ▝?'],
    sprite: [
      '             ',
      ' ┏━━━━━━━━━┓ ',
      '┏┛  ?   ?  ┗┓',
      '┗┓         ┏┛',
      ' ┗┳┳┳┳━┳┳┳┳┛ ',
      '  ┗┛┗┛ ┗┛┗┛  ',
    ],
  },
];

// Helper: get Claudes by rarity
export function getClaudesByRarity(rarity) {
  return ALL_CLAUDES.filter(c => c.rarity === rarity);
}

// Helper: find Claude by id
export function getClaudeById(id) {
  return ALL_CLAUDES.find(c => c.id === id);
}
