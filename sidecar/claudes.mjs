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
//   [acc]          line 0: accessory (or 5 spaces)
//   ▐· ·▌          line 1: face
//    ▘ ▝           line 2: feet

export const RARITY_NAMES = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
export const RARITY_STARS = ['', '\u2605', '\u2605\u2605', '\u2605\u2605\u2605', '\u2605\u2605\u2605\u2605', '\u2605\u2605\u2605\u2605\u2605'];

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
    mini: ['     ', '\u2590\u00b7 \u00b7\u258c', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  \u2596   \u2597  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'sleepy', name: 'Sleepy', rarity: 1,
    desc: 'Zzz... five more minutes.',
    mini: ['  z  ', '\u2590- -\u258c', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  \u2581   \u2581  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'happy', name: 'Happy', rarity: 1,
    desc: 'Having a great day!',
    mini: ['     ', '\u2590^ ^\u258c', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  ^   ^  \u2517\u2513',
      '\u2517\u2513    u    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'thinker', name: 'Thinker', rarity: 1,
    desc: 'Deep in thought...',
    mini: ['    ?', '\u2590\u00b7 \u00b7\u258c', ' \u2598~\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513?',
      '\u250f\u251b  \u2596   \u2597  \u2517\u2513',
      '\u2517\u2513    ~    \u250f\u251b',
      '?\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b ?',
    ],
  },
  {
    id: 'shy', name: 'Shy', rarity: 1,
    desc: "D-don't look at me!",
    mini: ['     ', '\u2590>.<\u258c', ' \u2598.\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  >   <  \u2517\u2513',
      '\u2517\u2513//  \u00b7  //\u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'wink', name: 'Wink', rarity: 1,
    desc: '*wink*',
    mini: ['     ', '\u2590~ \u00b7\u258c', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b* _   \u2597  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'surprised', name: 'Surprised', rarity: 1,
    desc: 'Whoa, what was that?!',
    mini: ['  !  ', '\u2590O O\u258c', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501!\u2513 ',
      '\u250f\u251b  O   O  \u2517\u2513',
      '\u2517\u2513    o    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'chill', name: 'Chill', rarity: 1,
    desc: 'No worries, mate.',
    mini: ['     ', '\u2590- \u00b7\u258c', ' \u2598  \u259d'],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  \u2581   \u2597  \u2517\u2513',
      '\u2517\u2513    ~    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // \u2605\u2605 Uncommon (8)
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'cat', name: 'Cat', rarity: 2,
    desc: 'Meow~ Purrs on compile.',
    mini: [' \u25b2 \u25b2 ', '\u2590=w=\u258c', ' \u2598 ~ '],
    sprite: [
      '   \u25e2\u25e3   \u25e2\u25e3   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  \u2581   \u2581  \u2517\u2513',
      '\u2517\u2513 =  w  = \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b~',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'pirate', name: 'Pirate', rarity: 2,
    desc: "Arr! Where's me code?",
    mini: [' \u2581\u2580\u2580\u2581', '\u2590\u00b7 x\u258c', ' \u2598 \u259d '],
    sprite: [
      '   \u2581\u259f\u2588\u2588\u2588\u2599\u2581   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  \u2596   X  \u2517\u2513',
      '\u2517\u2513    =    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'chef', name: 'Chef', rarity: 2,
    desc: 'Cooking up some code.',
    mini: [' \u2580\u2580\u2580 ', '\u2590u u\u258c', ' \u2598 \u259d '],
    sprite: [
      '   \u259c\u2588\u259c\u2588\u259b\u2588\u259b   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  u   u  \u2517\u2513',
      '\u2517\u2513    -    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'dj', name: 'DJ', rarity: 2,
    desc: 'Droppin sick beats.',
    mini: ['d   b', '\u2590~ ~\u258c', ' \u2598 \u259d '],
    sprite: [
      '\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513',
      '\u2588\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513\u2588',
      '\u250f\u251b  ~   ~  \u2517\u2513',
      '\u2517\u2513    V    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'nerd', name: 'Nerd', rarity: 2,
    desc: "Well, actually...",
    mini: ['     ', '\u2590# #\u258c', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  #   #  \u2517\u2513',
      '\u2517\u2513   ---   \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'grumpy', name: 'Grumpy', rarity: 2,
    desc: 'Everything is broken.',
    mini: ['     ', '\u2590> <\u258c', ' \u2598_\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  >   <  \u2517\u2513',
      '\u2517\u2513    _    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'royal', name: 'Royal', rarity: 2,
    desc: 'Your Majesty!',
    mini: ['w\u25e3\u25b2\u25e2w', '\u2590o O\u258c', ' \u2598 \u259d '],
    sprite: [
      '   \u25e3\u25e2\u25e3\u25e2\u25e3\u25e2    ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  o   O  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'zombie', name: 'Zombie', rarity: 2,
    desc: 'Undead and coding...',
    mini: ['     ', '\u2590x x\u258c', ' \u2596 \u2597 '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501#\u2501\u2513 ',
      '\u250f\u251b  x   x  \u2517\u2513',
      '\u2517\u2513#   \u2580\u259c   \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★★ Rare (6)
  // ═══════════════════════════════════
  {
    id: 'ninja', name: 'Ninja', rarity: 3,
    desc: 'Silent but deadly.',
    mini: [' \u2584\u2584\u2584 ', '\u2590-@-\u258c', ' \u259a \u259e '],
    sprite: [
      '             ',
      ' \u250f\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2513<',
      '\u250f\u251b  \u2581 @ \u2581  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'wizard', name: 'Wizard', rarity: 3,
    desc: 'Casting code spells!',
    mini: ['\u2581\u259f\u2599\u2581 ', '\u2590* *\u258c', ' \u2598 \u259d '],
    sprite: [
      '     \u2581\u259f\u2599\u2581    ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  *   *  \u2517\u2513',
      '\u2517\u2513    +    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'astro', name: 'Astro', rarity: 3,
    desc: 'To the stars!',
    mini: ['(   )', '\u2590\u00b7 \u00b7\u258c', ' \u2598 \u259d '],
    sprite: [
      '    \u2581\u2581\u2581\u2581\u2581    ',
      ' \u250f(\u2501\u2501\u2501\u2501\u2501\u2501\u2501)\u2513 ',
      '\u250f\u251b  \u2596   \u2597  \u2517\u2513',
      '\u2517\u2513    \u25bd    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'samurai', name: 'Samurai', rarity: 3,
    desc: 'The way of code.',
    mini: ['\u2501\u2501\u25b2\u2501\u2501', '\u2590= =\u258c', ' \u2598 \u259d '],
    sprite: [
      '  \u2501\u2501\u2501\u2501\u25b2\u2501\u2501\u2501\u2501  ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  =   =  \u2517\u2513',
      '\u2517\u2513    \u2581    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'ghost', name: 'Ghost', rarity: 3,
    desc: 'Boo! ...can you see me?',
    mini: ['     ', '\u2590\u00b7 \u00b7\u258c', ' ~~~ '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2596   \u2597  \u2503 ',
      ' \u2503         \u2503 ',
      ' \u2517~~~~~~~~~\u251b ',
      '             ',
    ],
  },
  {
    id: 'pixel', name: 'Pixel', rarity: 3,
    desc: '8-bit vibes.',
    mini: ['     ', '\u2588\u2588 \u2588\u2588', ' \u2588 \u2588 '],
    sprite: [
      '  \u2588\u2588     \u2588\u2588  ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  \u2588   \u2588  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★★★ Epic (4)
  // ═══════════════════════════════════
  {
    id: 'dragon', name: 'Dragon', rarity: 4,
    desc: 'Breathes fire and code.',
    mini: ['w   w', '\u2590O O\u258c', ' \u2598M\u259d '],
    sprite: [
      '   w\u25e2   \u25e3w   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  O   O  \u2517\u2513',
      '\u2517\u2513    M    \u250f\u251b',
      'W\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251bW',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'mecha', name: 'Mecha', rarity: 4,
    desc: 'Fully armored.',
    mini: ['|   |', '[# #]', '=\u2598 \u259d='],
    sprite: [
      '   |\u2590   \u258c|   ',
      ' \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557 ',
      '\u2554\u255d  #   #  \u255a\u2557',
      '\u255a\u2557         \u2554\u255d',
      ' \u255a\u2566\u2566\u2566\u2566\u2550\u2566\u2566\u2566\u2566\u255d ',
      ' =\u255a\u255d\u255a\u255d \u255a\u255d\u255a\u255d= ',
    ],
  },
  {
    id: 'phoenix', name: 'Phoenix', rarity: 4,
    desc: 'Rises from every crash.',
    mini: ['~ ~ ~', '\u2590^ ^\u258c', '~\u2598 \u259d~'],
    sprite: [
      '  ~\u2572\u2581\u2581\u2581\u2581\u2581\u2571~  ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  ^   ^  \u2517\u2513',
      '\u2517\u2513    v    \u250f\u251b',
      '~\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b~',
      ' ~\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b~ ',
    ],
  },
  {
    id: 'galaxy', name: 'Galaxy', rarity: 4,
    desc: 'Made of stardust.',
    mini: ['* * *', '\u2590@ @\u258c', '*\u2598 \u259d*'],
    sprite: [
      '   *     *   ',
      '*\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  @   @  \u2517\u2513',
      '\u2517\u2513    *    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b*',
      ' *\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },

  // ═══════════════════════════════════
  // ★★★★★ Legendary (3)
  // ═══════════════════════════════════
  {
    id: 'opus', name: 'Opus', rarity: 5,
    desc: 'The ultimate form.',
    mini: ['* * *', '{\u25c6 \u25c6}', '<\u2598 \u259d>'],
    sprite: [
      '  *  \u2581\u2581\u2581  *  ',
      '*\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513*',
      '\u250f\u251b  \u25c6   \u25c6  \u2517\u2513',
      '\u2517\u2513    \u2501    \u250f\u251b',
      '*\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b*',
      ' *\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b* ',
    ],
  },
  {
    id: 'rainbow', name: 'Rainbow', rarity: 5,
    desc: 'All colors at once.',
    mini: ['~~~~~', '\u2590o~o\u258c', ' \u2598 \u259d '],
    sprite: [
      ' ~~ ~~~~~ ~~ ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  o   o  \u2517\u2513',
      '\u2517\u2513    ~    \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'mystery', name: '???', rarity: 5,
    desc: 'Nobody knows what this is.',
    mini: ['? ? ?', '\u2590? ?\u258c', '?\u2598 \u259d?'],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      '\u250f\u251b  ?   ?  \u2517\u2513',
      '\u2517\u2513         \u250f\u251b',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
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
