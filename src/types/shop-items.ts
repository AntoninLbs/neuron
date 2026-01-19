// src/types/shop-items.ts
// 100 couleurs + 300 accessoires pour la boutique

export interface ShopColor {
  id: string
  name: string
  value: string
  icon: string
  rare?: boolean
}

export interface ShopAccessory {
  id: string
  name: string
  value: string
  icon: string
  rare?: boolean
}

// ============================================
// 100 COULEURS
// ============================================

export const ALL_COLORS: ShopColor[] = [
  // Oranges (10)
  { id: 'orange', name: 'Orange', value: '#f97316', icon: '🧡' },
  { id: 'orange_light', name: 'Orange clair', value: '#fb923c', icon: '🧡' },
  { id: 'orange_dark', name: 'Orange foncé', value: '#ea580c', icon: '🧡' },
  { id: 'tangerine', name: 'Mandarine', value: '#ff8c00', icon: '🍊' },
  { id: 'peach', name: 'Pêche', value: '#ffab91', icon: '🍑' },
  { id: 'coral', name: 'Corail', value: '#ff7f50', icon: '🪸' },
  { id: 'salmon', name: 'Saumon', value: '#fa8072', icon: '🐟' },
  { id: 'apricot', name: 'Abricot', value: '#fbceb1', icon: '🍑' },
  { id: 'amber', name: 'Ambre', value: '#f59e0b', icon: '🧡' },
  { id: 'carrot', name: 'Carotte', value: '#ed9121', icon: '🥕' },
  
  // Rouges (10)
  { id: 'red', name: 'Rouge', value: '#ef4444', icon: '❤️' },
  { id: 'red_light', name: 'Rouge clair', value: '#f87171', icon: '❤️' },
  { id: 'red_dark', name: 'Rouge foncé', value: '#dc2626', icon: '❤️' },
  { id: 'crimson', name: 'Cramoisi', value: '#dc143c', icon: '🔴' },
  { id: 'cherry', name: 'Cerise', value: '#de3163', icon: '🍒' },
  { id: 'ruby', name: 'Rubis', value: '#e0115f', icon: '💎', rare: true },
  { id: 'scarlet', name: 'Écarlate', value: '#ff2400', icon: '🔴' },
  { id: 'burgundy', name: 'Bordeaux', value: '#800020', icon: '🍷' },
  { id: 'maroon', name: 'Marron', value: '#800000', icon: '🤎' },
  { id: 'rose_red', name: 'Rose rouge', value: '#c21e56', icon: '🌹' },
  
  // Roses (10)
  { id: 'pink', name: 'Rose', value: '#ec4899', icon: '🩷' },
  { id: 'pink_light', name: 'Rose clair', value: '#f9a8d4', icon: '🩷' },
  { id: 'pink_dark', name: 'Rose foncé', value: '#db2777', icon: '🩷' },
  { id: 'hot_pink', name: 'Rose vif', value: '#ff69b4', icon: '💗' },
  { id: 'magenta', name: 'Magenta', value: '#ff00ff', icon: '🩷' },
  { id: 'fuchsia', name: 'Fuchsia', value: '#d946ef', icon: '💜' },
  { id: 'blush', name: 'Blush', value: '#de5d83', icon: '🌸' },
  { id: 'rose', name: 'Rose pâle', value: '#f43f5e', icon: '🌹' },
  { id: 'bubblegum', name: 'Bubblegum', value: '#ffc1cc', icon: '🍬' },
  { id: 'flamingo', name: 'Flamant', value: '#fc8eac', icon: '🦩' },
  
  // Violets (10)
  { id: 'purple', name: 'Violet', value: '#8b5cf6', icon: '💜' },
  { id: 'purple_light', name: 'Violet clair', value: '#a78bfa', icon: '💜' },
  { id: 'purple_dark', name: 'Violet foncé', value: '#7c3aed', icon: '💜' },
  { id: 'lavender', name: 'Lavande', value: '#e6e6fa', icon: '💜' },
  { id: 'orchid', name: 'Orchidée', value: '#da70d6', icon: '🪻' },
  { id: 'plum', name: 'Prune', value: '#dda0dd', icon: '🫐' },
  { id: 'grape', name: 'Raisin', value: '#6f2da8', icon: '🍇' },
  { id: 'amethyst', name: 'Améthyste', value: '#9966cc', icon: '💎', rare: true },
  { id: 'violet', name: 'Violette', value: '#ee82ee', icon: '🪻' },
  { id: 'mauve', name: 'Mauve', value: '#e0b0ff', icon: '💜' },
  
  // Bleus (15)
  { id: 'blue', name: 'Bleu', value: '#3b82f6', icon: '💙' },
  { id: 'blue_light', name: 'Bleu clair', value: '#93c5fd', icon: '💙' },
  { id: 'blue_dark', name: 'Bleu foncé', value: '#1d4ed8', icon: '💙' },
  { id: 'sky', name: 'Ciel', value: '#0ea5e9', icon: '☁️' },
  { id: 'navy', name: 'Marine', value: '#000080', icon: '⚓' },
  { id: 'royal', name: 'Royal', value: '#4169e1', icon: '👑' },
  { id: 'ocean', name: 'Océan', value: '#006994', icon: '🌊' },
  { id: 'azure', name: 'Azur', value: '#007fff', icon: '💎' },
  { id: 'cobalt', name: 'Cobalt', value: '#0047ab', icon: '💙' },
  { id: 'sapphire', name: 'Saphir', value: '#0f52ba', icon: '💎', rare: true },
  { id: 'indigo', name: 'Indigo', value: '#6366f1', icon: '💙' },
  { id: 'electric', name: 'Électrique', value: '#7df9ff', icon: '⚡' },
  { id: 'ice', name: 'Glace', value: '#a5f3fc', icon: '🧊' },
  { id: 'denim', name: 'Denim', value: '#1560bd', icon: '👖' },
  { id: 'midnight', name: 'Minuit', value: '#191970', icon: '🌙' },
  
  // Cyans (8)
  { id: 'cyan', name: 'Cyan', value: '#06b6d4', icon: '🩵' },
  { id: 'cyan_light', name: 'Cyan clair', value: '#67e8f9', icon: '🩵' },
  { id: 'aqua', name: 'Aqua', value: '#00ffff', icon: '💧' },
  { id: 'teal', name: 'Turquoise', value: '#14b8a6', icon: '🩵' },
  { id: 'turquoise', name: 'Turquoise vif', value: '#40e0d0', icon: '💎' },
  { id: 'aquamarine', name: 'Aigue-marine', value: '#7fffd4', icon: '💎', rare: true },
  { id: 'lagoon', name: 'Lagon', value: '#017987', icon: '🏝️' },
  { id: 'caribbean', name: 'Caraïbes', value: '#00cccc', icon: '🌴' },
  
  // Verts (15)
  { id: 'green', name: 'Vert', value: '#22c55e', icon: '💚' },
  { id: 'green_light', name: 'Vert clair', value: '#86efac', icon: '💚' },
  { id: 'green_dark', name: 'Vert foncé', value: '#16a34a', icon: '💚' },
  { id: 'lime', name: 'Lime', value: '#84cc16', icon: '🍋' },
  { id: 'emerald', name: 'Émeraude', value: '#10b981', icon: '💎', rare: true },
  { id: 'mint', name: 'Menthe', value: '#98fb98', icon: '🌿' },
  { id: 'forest', name: 'Forêt', value: '#228b22', icon: '🌲' },
  { id: 'olive', name: 'Olive', value: '#808000', icon: '🫒' },
  { id: 'sage', name: 'Sauge', value: '#9dc183', icon: '🌿' },
  { id: 'jade', name: 'Jade', value: '#00a86b', icon: '💎' },
  { id: 'seafoam', name: 'Écume', value: '#71eeb8', icon: '🌊' },
  { id: 'spring', name: 'Printemps', value: '#00ff7f', icon: '🌸' },
  { id: 'moss', name: 'Mousse', value: '#8a9a5b', icon: '🌿' },
  { id: 'avocado', name: 'Avocat', value: '#568203', icon: '🥑' },
  { id: 'pistachio', name: 'Pistache', value: '#93c572', icon: '🥜' },
  
  // Jaunes (10)
  { id: 'yellow', name: 'Jaune', value: '#eab308', icon: '💛' },
  { id: 'yellow_light', name: 'Jaune clair', value: '#fef08a', icon: '💛' },
  { id: 'gold', name: 'Or', value: '#ffd700', icon: '⭐', rare: true },
  { id: 'lemon', name: 'Citron', value: '#fff44f', icon: '🍋' },
  { id: 'honey', name: 'Miel', value: '#eb9605', icon: '🍯' },
  { id: 'mustard', name: 'Moutarde', value: '#ffdb58', icon: '🌭' },
  { id: 'canary', name: 'Canari', value: '#ffef00', icon: '🐤' },
  { id: 'butter', name: 'Beurre', value: '#fffacd', icon: '🧈' },
  { id: 'banana', name: 'Banane', value: '#ffe135', icon: '🍌' },
  { id: 'sunshine', name: 'Soleil', value: '#fffd37', icon: '☀️' },
  
  // Gris/Neutres (7)
  { id: 'slate', name: 'Ardoise', value: '#64748b', icon: '🩶' },
  { id: 'gray', name: 'Gris', value: '#9ca3af', icon: '🩶' },
  { id: 'charcoal', name: 'Charbon', value: '#36454f', icon: '⬛' },
  { id: 'silver', name: 'Argent', value: '#c0c0c0', icon: '🥈', rare: true },
  { id: 'smoke', name: 'Fumée', value: '#738276', icon: '💨' },
  { id: 'steel', name: 'Acier', value: '#71797e', icon: '⚙️' },
  { id: 'zinc', name: 'Zinc', value: '#71717a', icon: '🩶' },
  
  // Spéciaux/Rares (5)
  { id: 'rainbow', name: 'Arc-en-ciel', value: 'rainbow', icon: '🌈', rare: true },
  { id: 'diamond', name: 'Diamant', value: '#b9f2ff', icon: '💎', rare: true },
  { id: 'obsidian', name: 'Obsidienne', value: '#1a1a2e', icon: '🖤', rare: true },
  { id: 'bronze', name: 'Bronze', value: '#cd7f32', icon: '🥉', rare: true },
  { id: 'copper', name: 'Cuivre', value: '#b87333', icon: '🪙', rare: true },
]

// ============================================
// 300 ACCESSOIRES (organisés par catégorie)
// ============================================

export const ALL_ACCESSORIES: ShopAccessory[] = [
  // === LUNETTES (30) ===
  { id: 'glasses', name: 'Lunettes', value: 'glasses', icon: '👓' },
  { id: 'sunglasses', name: 'Lunettes soleil', value: 'sunglasses', icon: '🕶️' },
  { id: 'glasses_round', name: 'Lunettes rondes', value: 'glasses_round', icon: '👓' },
  { id: 'glasses_square', name: 'Lunettes carrées', value: 'glasses_square', icon: '👓' },
  { id: 'glasses_heart', name: 'Lunettes cœur', value: 'glasses_heart', icon: '💕' },
  { id: 'glasses_star', name: 'Lunettes étoile', value: 'glasses_star', icon: '⭐' },
  { id: 'glasses_cat', name: 'Lunettes cat-eye', value: 'glasses_cat', icon: '😺' },
  { id: 'glasses_aviator', name: 'Aviator', value: 'glasses_aviator', icon: '✈️' },
  { id: 'glasses_nerd', name: 'Lunettes nerd', value: 'glasses_nerd', icon: '🤓' },
  { id: 'glasses_3d', name: 'Lunettes 3D', value: 'glasses_3d', icon: '🎬' },
  { id: 'monocle', name: 'Monocle', value: 'monocle', icon: '🧐', rare: true },
  { id: 'glasses_rainbow', name: 'Lunettes arc-en-ciel', value: 'glasses_rainbow', icon: '🌈' },
  { id: 'glasses_pixel', name: 'Lunettes pixel', value: 'glasses_pixel', icon: '👾' },
  { id: 'glasses_vr', name: 'Casque VR', value: 'glasses_vr', icon: '🥽' },
  { id: 'glasses_ski', name: 'Masque ski', value: 'glasses_ski', icon: '⛷️' },
  { id: 'glasses_swim', name: 'Lunettes natation', value: 'glasses_swim', icon: '🏊' },
  { id: 'glasses_retro', name: 'Lunettes rétro', value: 'glasses_retro', icon: '📺' },
  { id: 'glasses_gold', name: 'Lunettes dorées', value: 'glasses_gold', icon: '✨', rare: true },
  { id: 'glasses_diamond', name: 'Lunettes diamant', value: 'glasses_diamond', icon: '💎', rare: true },
  { id: 'glasses_fire', name: 'Lunettes flamme', value: 'glasses_fire', icon: '🔥' },
  { id: 'glasses_ice', name: 'Lunettes glace', value: 'glasses_ice', icon: '❄️' },
  { id: 'glasses_pink', name: 'Lunettes roses', value: 'glasses_pink', icon: '🩷' },
  { id: 'glasses_blue', name: 'Lunettes bleues', value: 'glasses_blue', icon: '💙' },
  { id: 'glasses_green', name: 'Lunettes vertes', value: 'glasses_green', icon: '💚' },
  { id: 'glasses_purple', name: 'Lunettes violettes', value: 'glasses_purple', icon: '💜' },
  { id: 'glasses_orange', name: 'Lunettes orange', value: 'glasses_orange', icon: '🧡' },
  { id: 'glasses_red', name: 'Lunettes rouges', value: 'glasses_red', icon: '❤️' },
  { id: 'glasses_yellow', name: 'Lunettes jaunes', value: 'glasses_yellow', icon: '💛' },
  { id: 'glasses_cyber', name: 'Lunettes cyber', value: 'glasses_cyber', icon: '🤖' },
  { id: 'glasses_steampunk', name: 'Lunettes steampunk', value: 'glasses_steampunk', icon: '⚙️', rare: true },
  
  // === CHAPEAUX (50) ===
  { id: 'hat', name: 'Chapeau', value: 'hat', icon: '🎩' },
  { id: 'cap', name: 'Casquette', value: 'cap', icon: '🧢' },
  { id: 'crown', name: 'Couronne', value: 'crown', icon: '👑', rare: true },
  { id: 'crown_princess', name: 'Diadème', value: 'crown_princess', icon: '👸', rare: true },
  { id: 'wizard', name: 'Chapeau sorcier', value: 'wizard', icon: '🧙', rare: true },
  { id: 'party', name: 'Chapeau fête', value: 'party', icon: '🎉' },
  { id: 'santa', name: 'Bonnet Noël', value: 'santa', icon: '🎅' },
  { id: 'pirate', name: 'Tricorne pirate', value: 'pirate', icon: '🏴‍☠️' },
  { id: 'cowboy', name: 'Chapeau cowboy', value: 'cowboy', icon: '🤠' },
  { id: 'beret', name: 'Béret', value: 'beret', icon: '🇫🇷' },
  { id: 'beanie', name: 'Bonnet', value: 'beanie', icon: '🧶' },
  { id: 'chef', name: 'Toque chef', value: 'chef', icon: '👨‍🍳' },
  { id: 'graduation', name: 'Toque diplômé', value: 'graduation', icon: '🎓' },
  { id: 'helmet', name: 'Casque', value: 'helmet', icon: '⛑️' },
  { id: 'viking', name: 'Casque viking', value: 'viking', icon: '🪓' },
  { id: 'knight', name: 'Heaume chevalier', value: 'knight', icon: '⚔️', rare: true },
  { id: 'astronaut', name: 'Casque astronaute', value: 'astronaut', icon: '👨‍🚀', rare: true },
  { id: 'sombrero', name: 'Sombrero', value: 'sombrero', icon: '🇲🇽' },
  { id: 'fedora', name: 'Fedora', value: 'fedora', icon: '🎩' },
  { id: 'bowler', name: 'Chapeau melon', value: 'bowler', icon: '🎩' },
  { id: 'safari', name: 'Chapeau safari', value: 'safari', icon: '🦁' },
  { id: 'fez', name: 'Fez', value: 'fez', icon: '🔴' },
  { id: 'turban', name: 'Turban', value: 'turban', icon: '🧕' },
  { id: 'headband', name: 'Bandeau', value: 'headband', icon: '🏃' },
  { id: 'bandana', name: 'Bandana', value: 'bandana', icon: '🎸' },
  { id: 'snapback', name: 'Snapback', value: 'snapback', icon: '🧢' },
  { id: 'bucket', name: 'Bob', value: 'bucket', icon: '🎣' },
  { id: 'straw', name: 'Chapeau paille', value: 'straw', icon: '🌾' },
  { id: 'top_hat', name: 'Haut-de-forme', value: 'top_hat', icon: '🎩', rare: true },
  { id: 'jester', name: 'Chapeau bouffon', value: 'jester', icon: '🃏' },
  { id: 'propeller', name: 'Casquette hélice', value: 'propeller', icon: '🚁' },
  { id: 'helmet_bike', name: 'Casque vélo', value: 'helmet_bike', icon: '🚴' },
  { id: 'helmet_moto', name: 'Casque moto', value: 'helmet_moto', icon: '🏍️' },
  { id: 'hard_hat', name: 'Casque chantier', value: 'hard_hat', icon: '👷' },
  { id: 'firefighter', name: 'Casque pompier', value: 'firefighter', icon: '🚒' },
  { id: 'police', name: 'Casquette police', value: 'police', icon: '👮' },
  { id: 'nurse', name: 'Coiffe infirmière', value: 'nurse', icon: '👩‍⚕️' },
  { id: 'witch', name: 'Chapeau sorcière', value: 'witch', icon: '🧹' },
  { id: 'elf', name: 'Bonnet elfe', value: 'elf', icon: '🧝' },
  { id: 'bunny_ears', name: 'Oreilles lapin', value: 'bunny_ears', icon: '🐰' },
  { id: 'cat_ears', name: 'Oreilles chat', value: 'cat_ears', icon: '🐱' },
  { id: 'devil_horns', name: 'Cornes diable', value: 'devil_horns', icon: '😈' },
  { id: 'angel_halo', name: 'Auréole ange', value: 'angel_halo', icon: '😇', rare: true },
  { id: 'unicorn_horn', name: 'Corne licorne', value: 'unicorn_horn', icon: '🦄', rare: true },
  { id: 'antlers', name: 'Bois de cerf', value: 'antlers', icon: '🦌' },
  { id: 'bear_ears', name: 'Oreilles ours', value: 'bear_ears', icon: '🐻' },
  { id: 'fox_ears', name: 'Oreilles renard', value: 'fox_ears', icon: '🦊' },
  { id: 'wolf_ears', name: 'Oreilles loup', value: 'wolf_ears', icon: '🐺' },
  { id: 'panda_ears', name: 'Oreilles panda', value: 'panda_ears', icon: '🐼' },
  { id: 'koala_ears', name: 'Oreilles koala', value: 'koala_ears', icon: '🐨' },
  
  // === ACCESSOIRES TÊTE (30) ===
  { id: 'headphones', name: 'Casque audio', value: 'headphones', icon: '🎧' },
  { id: 'earbuds', name: 'Écouteurs', value: 'earbuds', icon: '🎵' },
  { id: 'antenna', name: 'Antenne', value: 'antenna', icon: '📡' },
  { id: 'spring', name: 'Ressort', value: 'spring', icon: '🔄' },
  { id: 'flower', name: 'Fleur', value: 'flower', icon: '🌸' },
  { id: 'rose', name: 'Rose', value: 'rose', icon: '🌹' },
  { id: 'sunflower', name: 'Tournesol', value: 'sunflower', icon: '🌻' },
  { id: 'cherry_blossom', name: 'Cerisier', value: 'cherry_blossom', icon: '🌸' },
  { id: 'daisy', name: 'Marguerite', value: 'daisy', icon: '🌼' },
  { id: 'tulip', name: 'Tulipe', value: 'tulip', icon: '🌷' },
  { id: 'leaf', name: 'Feuille', value: 'leaf', icon: '🍃' },
  { id: 'clover', name: 'Trèfle', value: 'clover', icon: '🍀' },
  { id: 'mushroom', name: 'Champignon', value: 'mushroom', icon: '🍄' },
  { id: 'cactus', name: 'Cactus', value: 'cactus', icon: '🌵' },
  { id: 'feather', name: 'Plume', value: 'feather', icon: '🪶' },
  { id: 'butterfly', name: 'Papillon', value: 'butterfly', icon: '🦋' },
  { id: 'dragonfly', name: 'Libellule', value: 'dragonfly', icon: '🪰' },
  { id: 'bee', name: 'Abeille', value: 'bee', icon: '🐝' },
  { id: 'ladybug', name: 'Coccinelle', value: 'ladybug', icon: '🐞' },
  { id: 'star', name: 'Étoile', value: 'star', icon: '⭐' },
  { id: 'moon', name: 'Lune', value: 'moon', icon: '🌙' },
  { id: 'sun', name: 'Soleil', value: 'sun', icon: '☀️' },
  { id: 'planet', name: 'Planète', value: 'planet', icon: '🪐' },
  { id: 'comet', name: 'Comète', value: 'comet', icon: '☄️' },
  { id: 'sparkle', name: 'Étincelle', value: 'sparkle', icon: '✨' },
  { id: 'lightning', name: 'Éclair', value: 'lightning', icon: '⚡' },
  { id: 'fire', name: 'Flamme', value: 'fire', icon: '🔥' },
  { id: 'snowflake', name: 'Flocon', value: 'snowflake', icon: '❄️' },
  { id: 'raindrop', name: 'Goutte', value: 'raindrop', icon: '💧' },
  { id: 'rainbow', name: 'Arc-en-ciel', value: 'rainbow', icon: '🌈' },
  
  // === NŒUDS/CRAVATES (20) ===
  { id: 'bowtie', name: 'Nœud papillon', value: 'bowtie', icon: '🎀' },
  { id: 'bowtie_red', name: 'Nœud pap rouge', value: 'bowtie_red', icon: '❤️' },
  { id: 'bowtie_blue', name: 'Nœud pap bleu', value: 'bowtie_blue', icon: '💙' },
  { id: 'bowtie_pink', name: 'Nœud pap rose', value: 'bowtie_pink', icon: '🩷' },
  { id: 'bowtie_gold', name: 'Nœud pap doré', value: 'bowtie_gold', icon: '⭐', rare: true },
  { id: 'bowtie_polka', name: 'Nœud pap pois', value: 'bowtie_polka', icon: '⚫' },
  { id: 'bowtie_stripe', name: 'Nœud pap rayé', value: 'bowtie_stripe', icon: '📏' },
  { id: 'tie', name: 'Cravate', value: 'tie', icon: '👔' },
  { id: 'tie_red', name: 'Cravate rouge', value: 'tie_red', icon: '❤️' },
  { id: 'tie_blue', name: 'Cravate bleue', value: 'tie_blue', icon: '💙' },
  { id: 'scarf', name: 'Écharpe', value: 'scarf', icon: '🧣' },
  { id: 'scarf_winter', name: 'Écharpe hiver', value: 'scarf_winter', icon: '❄️' },
  { id: 'scarf_rainbow', name: 'Écharpe arc-en-ciel', value: 'scarf_rainbow', icon: '🌈' },
  { id: 'bandana_neck', name: 'Foulard', value: 'bandana_neck', icon: '🎸' },
  { id: 'lei', name: 'Collier hawaïen', value: 'lei', icon: '🌺' },
  { id: 'necklace', name: 'Collier', value: 'necklace', icon: '📿' },
  { id: 'necklace_pearl', name: 'Collier perles', value: 'necklace_pearl', icon: '🦪', rare: true },
  { id: 'necklace_gold', name: 'Chaîne or', value: 'necklace_gold', icon: '⛓️', rare: true },
  { id: 'pendant', name: 'Pendentif', value: 'pendant', icon: '💎' },
  { id: 'medal', name: 'Médaille', value: 'medal', icon: '🏅' },
  
  // === OBJETS TENUS (40) ===
  { id: 'wand', name: 'Baguette', value: 'wand', icon: '🪄', rare: true },
  { id: 'sword', name: 'Épée', value: 'sword', icon: '⚔️' },
  { id: 'shield', name: 'Bouclier', value: 'shield', icon: '🛡️' },
  { id: 'trident', name: 'Trident', value: 'trident', icon: '🔱', rare: true },
  { id: 'staff', name: 'Bâton magique', value: 'staff', icon: '🏒' },
  { id: 'bow', name: 'Arc', value: 'bow', icon: '🏹' },
  { id: 'guitar', name: 'Guitare', value: 'guitar', icon: '🎸' },
  { id: 'microphone', name: 'Micro', value: 'microphone', icon: '🎤' },
  { id: 'camera', name: 'Appareil photo', value: 'camera', icon: '📷' },
  { id: 'phone', name: 'Téléphone', value: 'phone', icon: '📱' },
  { id: 'laptop', name: 'Ordinateur', value: 'laptop', icon: '💻' },
  { id: 'gamepad', name: 'Manette', value: 'gamepad', icon: '🎮' },
  { id: 'book', name: 'Livre', value: 'book', icon: '📚' },
  { id: 'pen', name: 'Stylo', value: 'pen', icon: '🖊️' },
  { id: 'paintbrush', name: 'Pinceau', value: 'paintbrush', icon: '🖌️' },
  { id: 'palette', name: 'Palette', value: 'palette', icon: '🎨' },
  { id: 'telescope', name: 'Télescope', value: 'telescope', icon: '🔭' },
  { id: 'microscope', name: 'Microscope', value: 'microscope', icon: '🔬' },
  { id: 'magnifier', name: 'Loupe', value: 'magnifier', icon: '🔍' },
  { id: 'flashlight', name: 'Lampe torche', value: 'flashlight', icon: '🔦' },
  { id: 'umbrella', name: 'Parapluie', value: 'umbrella', icon: '☂️' },
  { id: 'balloon', name: 'Ballon', value: 'balloon', icon: '🎈' },
  { id: 'flag', name: 'Drapeau', value: 'flag', icon: '🚩' },
  { id: 'trophy', name: 'Trophée', value: 'trophy', icon: '🏆', rare: true },
  { id: 'rose_hand', name: 'Rose tenue', value: 'rose_hand', icon: '🌹' },
  { id: 'coffee', name: 'Café', value: 'coffee', icon: '☕' },
  { id: 'tea', name: 'Thé', value: 'tea', icon: '🍵' },
  { id: 'soda', name: 'Soda', value: 'soda', icon: '🥤' },
  { id: 'pizza', name: 'Pizza', value: 'pizza', icon: '🍕' },
  { id: 'donut', name: 'Donut', value: 'donut', icon: '🍩' },
  { id: 'ice_cream', name: 'Glace', value: 'ice_cream', icon: '🍦' },
  { id: 'lollipop', name: 'Sucette', value: 'lollipop', icon: '🍭' },
  { id: 'candy', name: 'Bonbon', value: 'candy', icon: '🍬' },
  { id: 'cookie', name: 'Cookie', value: 'cookie', icon: '🍪' },
  { id: 'popcorn', name: 'Popcorn', value: 'popcorn', icon: '🍿' },
  { id: 'skateboard', name: 'Skateboard', value: 'skateboard', icon: '🛹' },
  { id: 'surfboard', name: 'Surf', value: 'surfboard', icon: '🏄' },
  { id: 'basketball', name: 'Basket', value: 'basketball', icon: '🏀' },
  { id: 'football', name: 'Ballon foot', value: 'football', icon: '⚽' },
  { id: 'tennis', name: 'Raquette', value: 'tennis', icon: '🎾' },
  
  // === BIJOUX (25) ===
  { id: 'earring', name: 'Boucle d\'oreille', value: 'earring', icon: '💎' },
  { id: 'earring_hoop', name: 'Créole', value: 'earring_hoop', icon: '⭕' },
  { id: 'earring_star', name: 'Boucle étoile', value: 'earring_star', icon: '⭐' },
  { id: 'earring_heart', name: 'Boucle cœur', value: 'earring_heart', icon: '❤️' },
  { id: 'earring_diamond', name: 'Boucle diamant', value: 'earring_diamond', icon: '💎', rare: true },
  { id: 'earring_pearl', name: 'Boucle perle', value: 'earring_pearl', icon: '🦪' },
  { id: 'ring', name: 'Bague', value: 'ring', icon: '💍' },
  { id: 'ring_diamond', name: 'Bague diamant', value: 'ring_diamond', icon: '💎', rare: true },
  { id: 'ring_ruby', name: 'Bague rubis', value: 'ring_ruby', icon: '❤️', rare: true },
  { id: 'bracelet', name: 'Bracelet', value: 'bracelet', icon: '📿' },
  { id: 'bracelet_gold', name: 'Bracelet or', value: 'bracelet_gold', icon: '⭐', rare: true },
  { id: 'bracelet_friendship', name: 'Bracelet amitié', value: 'bracelet_friendship', icon: '🤝' },
  { id: 'watch', name: 'Montre', value: 'watch', icon: '⌚' },
  { id: 'watch_gold', name: 'Montre or', value: 'watch_gold', icon: '⌚', rare: true },
  { id: 'watch_smart', name: 'Montre connectée', value: 'watch_smart', icon: '⌚' },
  { id: 'brooch', name: 'Broche', value: 'brooch', icon: '📍' },
  { id: 'brooch_flower', name: 'Broche fleur', value: 'brooch_flower', icon: '🌸' },
  { id: 'tiara', name: 'Tiare', value: 'tiara', icon: '👑', rare: true },
  { id: 'anklet', name: 'Chaîne cheville', value: 'anklet', icon: '⛓️' },
  { id: 'charm', name: 'Breloque', value: 'charm', icon: '🔮' },
  { id: 'amulet', name: 'Amulette', value: 'amulet', icon: '🧿', rare: true },
  { id: 'crystal', name: 'Cristal', value: 'crystal', icon: '💎' },
  { id: 'gem_red', name: 'Gemme rouge', value: 'gem_red', icon: '❤️' },
  { id: 'gem_blue', name: 'Gemme bleue', value: 'gem_blue', icon: '💙' },
  { id: 'gem_green', name: 'Gemme verte', value: 'gem_green', icon: '💚' },
  
  // === MASQUES/MAQUILLAGE (25) ===
  { id: 'mask_superhero', name: 'Masque super-héros', value: 'mask_superhero', icon: '🦸' },
  { id: 'mask_ninja', name: 'Masque ninja', value: 'mask_ninja', icon: '🥷' },
  { id: 'mask_cat', name: 'Masque chat', value: 'mask_cat', icon: '🐱' },
  { id: 'mask_dog', name: 'Masque chien', value: 'mask_dog', icon: '🐶' },
  { id: 'mask_panda', name: 'Masque panda', value: 'mask_panda', icon: '🐼' },
  { id: 'mask_fox', name: 'Masque renard', value: 'mask_fox', icon: '🦊' },
  { id: 'mask_owl', name: 'Masque hibou', value: 'mask_owl', icon: '🦉' },
  { id: 'mask_carnival', name: 'Loup carnaval', value: 'mask_carnival', icon: '🎭' },
  { id: 'mask_venetian', name: 'Masque vénitien', value: 'mask_venetian', icon: '🎭', rare: true },
  { id: 'mask_hockey', name: 'Masque hockey', value: 'mask_hockey', icon: '🏒' },
  { id: 'mask_gas', name: 'Masque gaz', value: 'mask_gas', icon: '😷' },
  { id: 'mask_surgical', name: 'Masque médical', value: 'mask_surgical', icon: '😷' },
  { id: 'makeup_blush', name: 'Blush', value: 'makeup_blush', icon: '🩷' },
  { id: 'makeup_lipstick', name: 'Rouge à lèvres', value: 'makeup_lipstick', icon: '💄' },
  { id: 'makeup_freckles', name: 'Taches de rousseur', value: 'makeup_freckles', icon: '🔴' },
  { id: 'makeup_star', name: 'Étoiles visage', value: 'makeup_star', icon: '⭐' },
  { id: 'makeup_heart', name: 'Cœurs joues', value: 'makeup_heart', icon: '❤️' },
  { id: 'makeup_glitter', name: 'Paillettes', value: 'makeup_glitter', icon: '✨' },
  { id: 'makeup_clown', name: 'Nez rouge', value: 'makeup_clown', icon: '🤡' },
  { id: 'tattoo_star', name: 'Tatouage étoile', value: 'tattoo_star', icon: '⭐' },
  { id: 'tattoo_heart', name: 'Tatouage cœur', value: 'tattoo_heart', icon: '❤️' },
  { id: 'tattoo_dragon', name: 'Tatouage dragon', value: 'tattoo_dragon', icon: '🐉', rare: true },
  { id: 'tattoo_tribal', name: 'Tatouage tribal', value: 'tattoo_tribal', icon: '🔥' },
  { id: 'scar', name: 'Cicatrice', value: 'scar', icon: '⚡' },
  { id: 'eyepatch', name: 'Cache-œil', value: 'eyepatch', icon: '🏴‍☠️' },
  
  // === AILES/DOS (20) ===
  { id: 'wings_angel', name: 'Ailes d\'ange', value: 'wings_angel', icon: '👼', rare: true },
  { id: 'wings_demon', name: 'Ailes démon', value: 'wings_demon', icon: '😈', rare: true },
  { id: 'wings_butterfly', name: 'Ailes papillon', value: 'wings_butterfly', icon: '🦋', rare: true },
  { id: 'wings_fairy', name: 'Ailes fée', value: 'wings_fairy', icon: '🧚', rare: true },
  { id: 'wings_dragon', name: 'Ailes dragon', value: 'wings_dragon', icon: '🐉', rare: true },
  { id: 'wings_bat', name: 'Ailes chauve-souris', value: 'wings_bat', icon: '🦇' },
  { id: 'wings_bird', name: 'Ailes oiseau', value: 'wings_bird', icon: '🕊️' },
  { id: 'wings_bee', name: 'Ailes abeille', value: 'wings_bee', icon: '🐝' },
  { id: 'cape', name: 'Cape', value: 'cape', icon: '🦸' },
  { id: 'cape_red', name: 'Cape rouge', value: 'cape_red', icon: '❤️' },
  { id: 'cape_royal', name: 'Cape royale', value: 'cape_royal', icon: '👑', rare: true },
  { id: 'cape_vampire', name: 'Cape vampire', value: 'cape_vampire', icon: '🧛' },
  { id: 'backpack', name: 'Sac à dos', value: 'backpack', icon: '🎒' },
  { id: 'backpack_rocket', name: 'Jetpack', value: 'backpack_rocket', icon: '🚀', rare: true },
  { id: 'backpack_wings', name: 'Sac ailé', value: 'backpack_wings', icon: '🎒' },
  { id: 'shell', name: 'Carapace', value: 'shell', icon: '🐢' },
  { id: 'tail_cat', name: 'Queue chat', value: 'tail_cat', icon: '🐱' },
  { id: 'tail_fox', name: 'Queue renard', value: 'tail_fox', icon: '🦊' },
  { id: 'tail_devil', name: 'Queue diable', value: 'tail_devil', icon: '😈' },
  { id: 'tail_mermaid', name: 'Queue sirène', value: 'tail_mermaid', icon: '🧜', rare: true },
  
  // === EFFETS/AURAS (30) ===
  { id: 'aura_fire', name: 'Aura feu', value: 'aura_fire', icon: '🔥', rare: true },
  { id: 'aura_ice', name: 'Aura glace', value: 'aura_ice', icon: '❄️', rare: true },
  { id: 'aura_electric', name: 'Aura électrique', value: 'aura_electric', icon: '⚡', rare: true },
  { id: 'aura_rainbow', name: 'Aura arc-en-ciel', value: 'aura_rainbow', icon: '🌈', rare: true },
  { id: 'aura_gold', name: 'Aura dorée', value: 'aura_gold', icon: '✨', rare: true },
  { id: 'aura_dark', name: 'Aura sombre', value: 'aura_dark', icon: '🖤', rare: true },
  { id: 'aura_love', name: 'Aura amour', value: 'aura_love', icon: '💕', rare: true },
  { id: 'aura_nature', name: 'Aura nature', value: 'aura_nature', icon: '🌿', rare: true },
  { id: 'sparkles', name: 'Étincelles', value: 'sparkles', icon: '✨' },
  { id: 'hearts_floating', name: 'Cœurs flottants', value: 'hearts_floating', icon: '💕' },
  { id: 'stars_floating', name: 'Étoiles flottantes', value: 'stars_floating', icon: '⭐' },
  { id: 'bubbles', name: 'Bulles', value: 'bubbles', icon: '🫧' },
  { id: 'confetti', name: 'Confettis', value: 'confetti', icon: '🎊' },
  { id: 'snow', name: 'Neige', value: 'snow', icon: '❄️' },
  { id: 'rain', name: 'Pluie', value: 'rain', icon: '🌧️' },
  { id: 'leaves', name: 'Feuilles', value: 'leaves', icon: '🍂' },
  { id: 'petals', name: 'Pétales', value: 'petals', icon: '🌸' },
  { id: 'fireflies', name: 'Lucioles', value: 'fireflies', icon: '✨' },
  { id: 'music_notes', name: 'Notes musique', value: 'music_notes', icon: '🎵' },
  { id: 'pixel_trail', name: 'Traînée pixel', value: 'pixel_trail', icon: '👾' },
  { id: 'neon_glow', name: 'Lueur néon', value: 'neon_glow', icon: '💡' },
  { id: 'smoke', name: 'Fumée', value: 'smoke', icon: '💨' },
  { id: 'flames', name: 'Flammes', value: 'flames', icon: '🔥' },
  { id: 'frost', name: 'Givre', value: 'frost', icon: '🥶' },
  { id: 'lightning_bolt', name: 'Éclairs', value: 'lightning_bolt', icon: '⚡' },
  { id: 'tornado', name: 'Tornade', value: 'tornado', icon: '🌪️' },
  { id: 'galaxy', name: 'Galaxie', value: 'galaxy', icon: '🌌', rare: true },
  { id: 'aurora', name: 'Aurore boréale', value: 'aurora', icon: '🌌', rare: true },
  { id: 'cherry_blossoms', name: 'Cerisiers', value: 'cherry_blossoms', icon: '🌸' },
  { id: 'emoji_rain', name: 'Pluie d\'emojis', value: 'emoji_rain', icon: '😀' },
  
  // === THÉMATIQUES (30) ===
  { id: 'theme_pirate', name: 'Set pirate', value: 'theme_pirate', icon: '🏴‍☠️' },
  { id: 'theme_ninja', name: 'Set ninja', value: 'theme_ninja', icon: '🥷' },
  { id: 'theme_wizard', name: 'Set sorcier', value: 'theme_wizard', icon: '🧙', rare: true },
  { id: 'theme_princess', name: 'Set princesse', value: 'theme_princess', icon: '👸', rare: true },
  { id: 'theme_knight', name: 'Set chevalier', value: 'theme_knight', icon: '⚔️', rare: true },
  { id: 'theme_astronaut', name: 'Set astronaute', value: 'theme_astronaut', icon: '👨‍🚀', rare: true },
  { id: 'theme_scientist', name: 'Set scientifique', value: 'theme_scientist', icon: '🔬' },
  { id: 'theme_artist', name: 'Set artiste', value: 'theme_artist', icon: '🎨' },
  { id: 'theme_musician', name: 'Set musicien', value: 'theme_musician', icon: '🎸' },
  { id: 'theme_chef', name: 'Set chef', value: 'theme_chef', icon: '👨‍🍳' },
  { id: 'theme_athlete', name: 'Set sportif', value: 'theme_athlete', icon: '🏃' },
  { id: 'theme_gamer', name: 'Set gamer', value: 'theme_gamer', icon: '🎮' },
  { id: 'theme_summer', name: 'Set été', value: 'theme_summer', icon: '🏖️' },
  { id: 'theme_winter', name: 'Set hiver', value: 'theme_winter', icon: '❄️' },
  { id: 'theme_halloween', name: 'Set Halloween', value: 'theme_halloween', icon: '🎃' },
  { id: 'theme_christmas', name: 'Set Noël', value: 'theme_christmas', icon: '🎄' },
  { id: 'theme_valentine', name: 'Set St-Valentin', value: 'theme_valentine', icon: '💕' },
  { id: 'theme_easter', name: 'Set Pâques', value: 'theme_easter', icon: '🐰' },
  { id: 'theme_school', name: 'Set école', value: 'theme_school', icon: '🎒' },
  { id: 'theme_graduation', name: 'Set diplômé', value: 'theme_graduation', icon: '🎓' },
  { id: 'theme_beach', name: 'Set plage', value: 'theme_beach', icon: '🏝️' },
  { id: 'theme_camping', name: 'Set camping', value: 'theme_camping', icon: '⛺' },
  { id: 'theme_royal', name: 'Set royal', value: 'theme_royal', icon: '👑', rare: true },
  { id: 'theme_cyber', name: 'Set cyber', value: 'theme_cyber', icon: '🤖', rare: true },
  { id: 'theme_steampunk', name: 'Set steampunk', value: 'theme_steampunk', icon: '⚙️', rare: true },
  { id: 'theme_retro', name: 'Set rétro', value: 'theme_retro', icon: '📺' },
  { id: 'theme_neon', name: 'Set néon', value: 'theme_neon', icon: '💡' },
  { id: 'theme_rainbow', name: 'Set arc-en-ciel', value: 'theme_rainbow', icon: '🌈' },
  { id: 'theme_galaxy', name: 'Set galaxie', value: 'theme_galaxy', icon: '🌌', rare: true },
  { id: 'theme_ocean', name: 'Set océan', value: 'theme_ocean', icon: '🌊' },
]

// ============================================
// PRIX
// ============================================

export const SHOP_PRICES = {
  color_common: 100,
  color_rare: 500,
  accessory_common: 150,
  accessory_rare: 400,
}

// ============================================
// BOUTIQUE DU JOUR (rotation aléatoire pure)
// ============================================

export function getDailyShop(date: Date = new Date()): {
  colors: ShopColor[]
  accessories: ShopAccessory[]
} {
  const dateString = date.toISOString().split('T')[0]
  const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Générateur pseudo-aléatoire basé sur la date
  const random = (max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000
    return Math.floor((x - Math.floor(x)) * max)
  }
  
  // Sélectionner 6 couleurs aléatoires
  const colorIndices = new Set<number>()
  let i = 0
  while (colorIndices.size < 6) {
    colorIndices.add(random(ALL_COLORS.length, i++))
  }
  const colors = Array.from(colorIndices).map(idx => ALL_COLORS[idx])
  
  // Sélectionner 4 accessoires aléatoires
  const accIndices = new Set<number>()
  i = 100
  while (accIndices.size < 4) {
    accIndices.add(random(ALL_ACCESSORIES.length, i++))
  }
  const accessories = Array.from(accIndices).map(idx => ALL_ACCESSORIES[idx])
  
  return { colors, accessories }
}

// ============================================
// BOOSTERS
// ============================================

export const BOOSTERS = {
  skip: { name: 'Passer', description: 'Passe 1 question difficile', icon: '⏭️', price: 50 },
  hint: { name: 'Indice', description: 'Révèle une lettre', icon: '💡', price: 30 },
  double_gems: { name: 'x2 Gems', description: 'Double les gems (24h)', icon: '💎', price: 200 },
  freeze: { name: 'Gel streak', description: 'Protège ton streak (1 jour)', icon: '🧊', price: 150 },
  extra_life: { name: 'Vie +1', description: '+1 erreur autorisée', icon: '❤️', price: 100 },
} as const

// ============================================
// DAILY REWARDS
// ============================================

export const DAILY_REWARDS = [
  { day: 1, gems: 10, icon: '💎' },
  { day: 2, gems: 10, icon: '💎' },
  { day: 3, gems: 20, icon: '💎' },
  { day: 4, gems: 25, icon: '💎' },
  { day: 5, gems: 50, icon: '🎁' },
] as const
