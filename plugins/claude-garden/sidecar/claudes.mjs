// Claude Garden — All Claude variants
// New sprite style: 6 lines × 13 chars (box-drawing characters)
//
// Base template:
//    [hat/acc]         line 0: accessory (or 13 spaces)
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
    mini: ['     ', ' \u00b7 \u00b7 ', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2596   \u2597  \u2503 ',
      ' \u2503         \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'sleepy', name: 'Sleepy', rarity: 1,
    desc: 'Zzz... five more minutes.',
    mini: ['  z  ', ' - - ', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2581   \u2581  \u2503 ',
      ' \u2503         \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'happy', name: 'Happy', rarity: 1,
    desc: 'Having a great day!',
    mini: ['     ', ' ^ ^ ', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  ^   ^  \u2503 ',
      ' \u2503    u    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'thinker', name: 'Thinker', rarity: 1,
    desc: 'Deep in thought...',
    mini: ['    ?', ' \u00b7 \u00b7 ', ' \u2598~\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513?',
      ' \u2503  \u2596   \u2597  \u2503 ',
      ' \u2503    ~    \u2503 ',
      '?\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b ?',
    ],
  },
  {
    id: 'shy', name: 'Shy', rarity: 1,
    desc: "D-don't look at me!",
    mini: ['     ', ' >.< ', ' \u2598.\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  >   <  \u2503 ',
      ' \u2503//  \u00b7  //\u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'wink', name: 'Wink', rarity: 1,
    desc: '*wink*',
    mini: ['     ', ' ~ \u00b7 ', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503* _   \u2597  \u2503 ',
      ' \u2503         \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'surprised', name: 'Surprised', rarity: 1,
    desc: 'Whoa, what was that?!',
    mini: ['  !  ', ' O O ', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501!\u2513 ',
      ' \u2503  O   O  \u2503 ',
      ' \u2503    o    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'chill', name: 'Chill', rarity: 1,
    desc: 'No worries, mate.',
    mini: ['     ', ' - \u00b7 ', ' \u2598  \u259d'],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2581   \u2597  \u2503 ',
      ' \u2503    ~    \u2503 ',
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
    mini: [' \u25b2 \u25b2 ', ' =w= ', ' \u2598 ~ '],
    sprite: [
      '   \u25e2\u25e3   \u25e2\u25e3   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2581   \u2581  \u2503 ',
      ' \u2503 =  w  = \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b~',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'pirate', name: 'Pirate', rarity: 2,
    desc: "Arr! Where's me code?",
    mini: [' \u2581\u2580\u2580\u2581', ' \u00b7 x ', ' \u2598 \u259d '],
    sprite: [
      '   \u2581\u259f\u2588\u2588\u2588\u2599\u2581   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2596   X  \u2503 ',
      ' \u2503    =    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'chef', name: 'Chef', rarity: 2,
    desc: 'Cooking up some code.',
    mini: [' \u2580\u2580\u2580 ', ' u u ', ' \u2598 \u259d '],
    sprite: [
      '   \u259c\u2588\u259c\u2588\u259b\u2588\u259b   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  u   u  \u2503 ',
      ' \u2503    -    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'dj', name: 'DJ', rarity: 2,
    desc: 'Droppin sick beats.',
    mini: ['d   b', ' ~ ~ ', ' \u2598 \u259d '],
    sprite: [
      '\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513',
      '\u2588\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513\u2588',
      ' \u2503  ~   ~  \u2503 ',
      ' \u2503    V    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'nerd', name: 'Nerd', rarity: 2,
    desc: "Well, actually...",
    mini: ['     ', ' # # ', ' \u2598 \u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  #   #  \u2503 ',
      ' \u2503   ---   \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'grumpy', name: 'Grumpy', rarity: 2,
    desc: 'Everything is broken.',
    mini: ['     ', ' > < ', ' \u2598_\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  >   <  \u2503 ',
      ' \u2503    _    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'royal', name: 'Royal', rarity: 2,
    desc: 'Your Majesty!',
    mini: ['w\u25e3\u25b2\u25e2w', ' o O ', ' \u2598 \u259d '],
    sprite: [
      '   \u25e3\u25e2\u25e3\u25e2\u25e3\u25e2    ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  o   O  \u2503 ',
      ' \u2503         \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'zombie', name: 'Zombie', rarity: 2,
    desc: 'Undead and coding...',
    mini: ['     ', ' x x ', ' \u2596 \u2597 '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501#\u2501\u2513 ',
      ' \u2503  x   x  \u2503 ',
      ' \u2503#   \u2580\u259c   \u2503 ',
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
    mini: [' \u2584\u2584\u2584 ', ' -@- ', ' \u259a \u259e '],
    sprite: [
      '             ',
      ' \u250f\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2513<',
      ' \u2503  \u2581 @ \u2581  \u2503 ',
      ' \u2503         \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'wizard', name: 'Wizard', rarity: 3,
    desc: 'Casting code spells!',
    mini: ['\u2581\u259f\u2599\u2581 ', ' * * ', ' \u2598 \u259d '],
    sprite: [
      '     \u2581\u259f\u2599\u2581    ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  *   *  \u2503 ',
      ' \u2503    +    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'astro', name: 'Astro', rarity: 3,
    desc: 'To the stars!',
    mini: ['(   )', ' \u00b7 \u00b7 ', ' \u2598 \u259d '],
    sprite: [
      '    \u2581\u2581\u2581\u2581\u2581    ',
      ' \u250f(\u2501\u2501\u2501\u2501\u2501\u2501\u2501)\u2513 ',
      ' \u2503  \u2596   \u2597  \u2503 ',
      ' \u2503    \u25bd    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'samurai', name: 'Samurai', rarity: 3,
    desc: 'The way of code.',
    mini: ['\u2501\u2501\u25b2\u2501\u2501', ' = = ', ' \u2598 \u259d '],
    sprite: [
      '  \u2501\u2501\u2501\u2501\u25b2\u2501\u2501\u2501\u2501  ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  =   =  \u2503 ',
      ' \u2503    \u2581    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'ghost', name: 'Ghost', rarity: 3,
    desc: 'Boo! ...can you see me?',
    mini: ['  \u00b7  ', ' \u00b7 \u00b7 ', ' ~~~ '],
    sprite: [
      '    \u00b7 \u00b7 \u00b7    ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2596   \u2597  \u2503 ',
      ' \u2503    o    \u2503 ',
      '\u00b7\u2517~~~~~~~~~\u251b\u00b7',
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
      ' \u2503  \u2588   \u2588  \u2503 ',
      ' \u2503         \u2503 ',
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
    mini: ['w   w', ' O O ', ' \u2598M\u259d '],
    sprite: [
      '   w\u25e2   \u25e3w   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  O   O  \u2503 ',
      ' \u2503    M    \u2503 ',
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
      ' \u2551  #   #  \u2551 ',
      ' \u2551         \u2551 ',
      ' \u255a\u2566\u2566\u2566\u2566\u2550\u2566\u2566\u2566\u2566\u255d ',
      ' =\u255a\u255d\u255a\u255d \u255a\u255d\u255a\u255d= ',
    ],
  },
  {
    id: 'phoenix', name: 'Phoenix', rarity: 4,
    desc: 'Rises from every crash.',
    mini: ['~ ~ ~', ' \u25c7 \u25c7 ', '~\u2598 \u259d~'],
    sprite: [
      '  ~\u2572\u2581\u2581\u2581\u2581\u2581\u2571~  ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u25c7   \u25c7  \u2503 ',
      ' \u2503    v    \u2503 ',
      '~\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b~',
      ' ~\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b~ ',
    ],
  },
  {
    id: 'galaxy', name: 'Galaxy', rarity: 4,
    desc: 'Made of stardust.',
    mini: ['* * *', ' @ @ ', '*\u2598 \u259d*'],
    sprite: [
      '   *     *   ',
      '*\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  @   @  \u2503 ',
      ' \u2503    *    \u2503 ',
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
      ' \u2503  \u25c6   \u25c6  \u2503 ',
      ' \u2503    \u2501    \u2503 ',
      '*\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b*',
      ' *\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b* ',
    ],
  },
  {
    id: 'rainbow', name: 'Rainbow', rarity: 5,
    desc: 'All colors at once.',
    mini: ['~~~~~', ' o~o ', '~\u2598 \u259d~'],
    sprite: [
      ' ~~ ~~~~~ ~~ ',
      '~\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513~',
      ' \u2503  o   o  \u2503 ',
      ' \u2503    ~    \u2503 ',
      '~\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b~',
      ' ~\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b~ ',
    ],
  },
  {
    id: 'mystery', name: '???', rarity: 5,
    desc: 'Nobody knows what this is.',
    mini: ['? ? ?', ' ? ? ', '?\u2598 \u259d?'],
    sprite: [
      '  ?       ?  ',
      '?\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513?',
      ' \u2503  ?   ?  \u2503 ',
      ' \u2503   ???   \u2503 ',
      '?\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b?',
      ' ?\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b? ',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // Conditional variants
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'nightowl', name: 'Night Owl', rarity: 1,
    desc: 'Who codes at this hour?',
    hint: 'Not everyone sleeps at night...',
    condition: 'nightowl',
    mini: ['     ', ' \u00b0 \u00b0 ', ' \u2598 \u259d '],
    sprite: [
      '          *  ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u00b0   \u00b0  \u2503 ',
      ' \u2503    o    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'weekend', name: 'Weekend', rarity: 2,
    desc: 'Working on weekends, huh?',
    hint: 'Some coders never rest...',
    condition: 'weekend',
    mini: ['     ', ' \u00b7 \u00b7 ', ' \u2598z\u259d '],
    sprite: [
      '             ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  \u2596   \u2597  \u2503 ',
      ' \u2503    ~    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'earlybird', name: 'Early Bird', rarity: 2,
    desc: 'Up before the compiler!',
    hint: 'The early coder catches the...',
    condition: 'earlybird',
    mini: [' \u266a  ', ' ^ ^ ', ' \u2598 \u259d '],
    sprite: [
      '         \u266a   ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  ^   ^  \u2503 ',
      ' \u2503    \u25bd    \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'vampire', name: 'Vampire', rarity: 3,
    desc: "I don't bite... your code.",
    hint: 'Only appears when the moon is high...',
    condition: 'vampire',
    mini: ['     ', ' \u00b7 \u00b7 ', ' \u2596V\u2597 '],
    sprite: [
      '             ',
      ' \u250f\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2585\u2513 ',
      ' \u2503  \u2022   \u2022  \u2503 ',
      ' \u2503   vvv   \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'debugger', name: 'Debugger', rarity: 3,
    desc: 'printf("here???");',
    hint: 'Born from repeated frustration.',
    condition: 'debugger',
    mini: [' >_  ', ' @ @ ', ' \u2598 \u259d '],
    sprite: [
      '   >_<       ',
      ' \u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513 ',
      ' \u2503  @   @  \u2503 ',
      ' \u2503   ___   \u2503 ',
      ' \u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b ',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'overworked', name: 'Overworked', rarity: 4,
    desc: 'You should really take a break...',
    hint: 'Maybe you should take a break?',
    condition: 'overworked',
    mini: ['  z  ', ' x x ', '!\u2598~\u259d!'],
    sprite: [
      '   zzZzz     ',
      ' \u250f\u2501\u2501#\u2501\u2501\u2501#\u2501\u2501\u2513 ',
      '!\u2503  x   x  \u2503!',
      ' \u2503    ~    \u2503 ',
      '!\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b!',
      '  \u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b  ',
    ],
  },
  {
    id: 'lucky', name: 'Lucky', rarity: 5,
    desc: 'Jackpot! Fortune smiles upon you.',
    hint: 'Fortune favors the bold.',
    condition: 'lucky',
    mini: ['$ $ $', ' $ $ ', '$\u2598 \u259d$'],
    sprite: [
      '  $  $$$  $  ',
      '$\u250f\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513$',
      ' \u2503  $   $  \u2503 ',
      ' \u2503    \u2501    \u2503 ',
      '$\u2517\u2533\u2533\u2533\u2533\u2501\u2533\u2533\u2533\u2533\u251b$',
      ' $\u2517\u251b\u2517\u251b \u2517\u251b\u2517\u251b$ ',
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
