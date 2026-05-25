import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// One-time seed endpoint — protected by header secret.
// The service role key is passed at call-time and never committed to the repo.
// Remove this file after seeding is complete.

const FRAGRANCES = [
  // ── DIOR ─────────────────────────────────────────────────────
  { name: 'Sauvage', brand: 'Dior', concentration: 'Eau de Toilette', release_year: 2015, longevity: 9, projection: 8, description: 'Fresh woody aromatic with bergamot and Ambroxan. One of the world\'s best-selling masculine fragrances.' },
  { name: 'Sauvage', brand: 'Dior', concentration: 'Eau de Parfum', release_year: 2018, longevity: 10, projection: 7, description: 'Deeper and spicier version with lavender, Sichuan pepper and Ambroxan.' },
  { name: 'Sauvage', brand: 'Dior', concentration: 'Parfum', release_year: 2019, longevity: 10, projection: 9, description: 'The most intense Sauvage — sandalwood-driven with commanding presence.' },
  { name: 'Fahrenheit', brand: 'Dior', concentration: 'Eau de Toilette', release_year: 1988, longevity: 9, projection: 8, description: 'Iconic gasoline-floral accord with violet, leather and cedar. A genuine classic.' },
  { name: 'Dior Homme Intense', brand: 'Dior', concentration: 'Eau de Parfum', release_year: 2007, longevity: 9, projection: 7, description: 'Powdery iris with lavender and patchouli. Elegant and quietly seductive.' },
  { name: 'Miss Dior', brand: 'Dior', concentration: 'Eau de Parfum', release_year: 2017, longevity: 8, projection: 7, description: 'Floral chypre with rose, peony and patchouli. Feminine and modern.' },
  { name: 'J\'adore', brand: 'Dior', concentration: 'Eau de Parfum', release_year: 1999, longevity: 8, projection: 8, description: 'Luminous floral bouquet with ylang-ylang, rose and jasmine.' },
  { name: 'Hypnotic Poison', brand: 'Dior', concentration: 'Eau de Toilette', release_year: 1998, longevity: 8, projection: 8, description: 'Dark almond, bitter almond and jasmine with vanilla. Addictive and mysterious.' },

  // ── CHANEL ───────────────────────────────────────────────────
  { name: 'Bleu de Chanel', brand: 'Chanel', concentration: 'Eau de Parfum', release_year: 2010, longevity: 8, projection: 7, description: 'Clean woody aromatic with citrus, incense and sandalwood.' },
  { name: 'Bleu de Chanel', brand: 'Chanel', concentration: 'Parfum', release_year: 2018, longevity: 10, projection: 7, description: 'Rich and woody with sandalwood, cedar and white musk. The definitive version.' },
  { name: 'Coco Mademoiselle', brand: 'Chanel', concentration: 'Eau de Parfum', release_year: 2001, longevity: 8, projection: 8, description: 'Fresh oriental with orange, rose, jasmine and vetiver. Effortlessly chic.' },
  { name: 'N°5', brand: 'Chanel', concentration: 'Eau de Parfum', release_year: 1921, longevity: 8, projection: 7, description: 'The world\'s most iconic fragrance — floral aldehyde with jasmine, rose and sandalwood.' },
  { name: 'Chance', brand: 'Chanel', concentration: 'Eau de Parfum', release_year: 2002, longevity: 7, projection: 7, description: 'Round and optimistic floral with patchouli, jasmine and white musk.' },
  { name: 'Allure Homme Sport', brand: 'Chanel', concentration: 'Eau de Toilette', release_year: 2004, longevity: 7, projection: 7, description: 'Fresh and sporty with cedar, white musk and sea notes.' },

  // ── ARMANI ───────────────────────────────────────────────────
  { name: 'Acqua di Giò', brand: 'Giorgio Armani', concentration: 'Eau de Toilette', release_year: 1996, longevity: 6, projection: 6, description: 'The defining aquatic fragrance of the 90s. Mediterranean citrus, jasmine and musk.' },
  { name: 'Acqua di Giò Profumo', brand: 'Giorgio Armani', concentration: 'Parfum', release_year: 2015, longevity: 9, projection: 7, description: 'Darker and more complex aquatic with incense, patchouli and bergamot.' },
  { name: 'Sì', brand: 'Giorgio Armani', concentration: 'Eau de Parfum', release_year: 2013, longevity: 8, projection: 7, description: 'Blackcurrant nectar, rose and vanilla. Feminine and confident.' },
  { name: 'My Way', brand: 'Giorgio Armani', concentration: 'Eau de Parfum', release_year: 2020, longevity: 8, projection: 7, description: 'Tuberose, bergamot and cedarwood. Inspired by wanderlust.' },

  // ── YVES SAINT LAURENT ───────────────────────────────────────
  { name: 'La Nuit de L\'Homme', brand: 'Yves Saint Laurent', concentration: 'Eau de Toilette', release_year: 2009, longevity: 7, projection: 7, description: 'Seductive cardamom, cedar and lavender. A go-to date night fragrance.' },
  { name: 'Y', brand: 'Yves Saint Laurent', concentration: 'Eau de Parfum', release_year: 2018, longevity: 8, projection: 8, description: 'Bold and fresh-spicy with sage, geranium and bergamot.' },
  { name: 'Black Opium', brand: 'Yves Saint Laurent', concentration: 'Eau de Parfum', release_year: 2014, longevity: 9, projection: 8, description: 'Addictive coffee, vanilla and white floral. Glamorous and provocative.' },
  { name: 'Mon Paris', brand: 'Yves Saint Laurent', concentration: 'Eau de Parfum', release_year: 2016, longevity: 8, projection: 8, description: 'Strawberry, peony and patchouli. A modern romantic floral.' },
  { name: 'Libre', brand: 'Yves Saint Laurent', concentration: 'Eau de Parfum', release_year: 2019, longevity: 9, projection: 8, description: 'Lavender and orange blossom with vanilla and musk. Gender-fluid and captivating.' },
  { name: 'L\'Homme', brand: 'Yves Saint Laurent', concentration: 'Eau de Parfum', release_year: 2016, longevity: 8, projection: 7, description: 'Refined ginger, basil, cedar and white pepper.' },

  // ── TOM FORD ─────────────────────────────────────────────────
  { name: 'Oud Wood', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2007, longevity: 9, projection: 7, description: 'Rare oud with rosewood, cardamom and sandalwood. Smooth, effortless luxury.' },
  { name: 'Tobacco Vanille', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2007, longevity: 10, projection: 8, description: 'Rich tobacco leaf, vanilla, tonka and cocoa. A winter season favourite.' },
  { name: 'Neroli Portofino', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2011, longevity: 7, projection: 7, description: 'Fresh Mediterranean neroli, bergamot and sea notes.' },
  { name: 'Lost Cherry', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2018, longevity: 9, projection: 8, description: 'Dark cherry, bitter almond and tonka. Gourmand and provocative.' },
  { name: 'Tuscan Leather', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2007, longevity: 9, projection: 8, description: 'Raw leather and raspberry on a saffron and amber base. Assertive and unapologetic.' },
  { name: 'Black Orchid', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2006, longevity: 9, projection: 8, description: 'Dark floral oriental with black truffle, orchid and patchouli.' },
  { name: 'Soleil Blanc', brand: 'Tom Ford', concentration: 'Eau de Parfum', release_year: 2015, longevity: 8, projection: 7, description: 'Coconut, tuberose and cardamom. Warm skin in sunlight.' },

  // ── CREED ────────────────────────────────────────────────────
  { name: 'Aventus', brand: 'Creed', concentration: 'Eau de Parfum', release_year: 2010, longevity: 9, projection: 8, description: 'Iconic pineapple, birch, jasmine and oakmoss. The benchmark masculine fragrance.' },
  { name: 'Silver Mountain Water', brand: 'Creed', concentration: 'Eau de Parfum', release_year: 1995, longevity: 8, projection: 7, description: 'Fresh green tea, blackcurrant and bergamot. Crisp mountain air in a bottle.' },
  { name: 'Green Irish Tweed', brand: 'Creed', concentration: 'Eau de Parfum', release_year: 1985, longevity: 8, projection: 7, description: 'The original masculine fresh fragrance. Lemon verbena, violet and sandalwood.' },
  { name: 'Viking', brand: 'Creed', concentration: 'Eau de Parfum', release_year: 2017, longevity: 9, projection: 8, description: 'Bergamot, pepper and pink berries on a sandalwood and birch base.' },
  { name: 'Millesime Imperial', brand: 'Creed', concentration: 'Eau de Parfum', release_year: 1995, longevity: 8, projection: 7, description: 'Sea salt, iris and musk. Clean ocean luxury.' },
  { name: 'Royal Oud', brand: 'Creed', concentration: 'Eau de Parfum', release_year: 2011, longevity: 9, projection: 8, description: 'Oud, cedar and galbanum. Regal and refined.' },

  // ── MAISON FRANCIS KURKDJIAN ──────────────────────────────────
  { name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', concentration: 'Eau de Parfum', release_year: 2015, longevity: 10, projection: 9, description: 'Luminous amber saffron and cedarwood. One of the most-imitated fragrances of the decade.' },
  { name: 'Gentle Fluidity Gold', brand: 'Maison Francis Kurkdjian', concentration: 'Eau de Parfum', release_year: 2019, longevity: 9, projection: 7, description: 'Nutmeg, vanilla and musk accord. Soft and enveloping.' },
  { name: 'Grand Soir', brand: 'Maison Francis Kurkdjian', concentration: 'Eau de Parfum', release_year: 2017, longevity: 9, projection: 7, description: 'Amber oriental with tonka, benzoin and musk. Memory of golden nights.' },

  // ── AMOUAGE ──────────────────────────────────────────────────
  { name: 'Interlude Man', brand: 'Amouage', concentration: 'Eau de Parfum', release_year: 2012, longevity: 10, projection: 9, description: 'Incense, oud and smoke on an amber base. Widely regarded as one of the greatest masculine fragrances ever made.' },
  { name: 'Reflection Man', brand: 'Amouage', concentration: 'Eau de Parfum', release_year: 2007, longevity: 9, projection: 8, description: 'Refined neroli, ylang-ylang and sandalwood. White floral for men done to perfection.' },
  { name: 'Jubilation XXV Man', brand: 'Amouage', concentration: 'Eau de Parfum', release_year: 2007, longevity: 10, projection: 8, description: 'Resinous myrrh, labdanum and agarwood with complex orchard fruits.' },
  { name: 'Epic Man', brand: 'Amouage', concentration: 'Eau de Parfum', release_year: 2009, longevity: 10, projection: 8, description: 'Cardamom, rose, oud and frankincense. An odyssey in a bottle.' },

  // ── FRÉDÉRIC MALLE ────────────────────────────────────────────
  { name: 'Portrait of a Lady', brand: 'Frédéric Malle', concentration: 'Eau de Parfum', release_year: 2010, longevity: 10, projection: 9, description: 'Magnificent rose absolute on a base of patchouli, incense and sandalwood.' },
  { name: 'Carnal Flower', brand: 'Frédéric Malle', concentration: 'Eau de Parfum', release_year: 2005, longevity: 9, projection: 8, description: 'Indolic tuberose absolute with coconut and musk. Unbridled sensuality.' },
  { name: 'Musc Ravageur', brand: 'Frédéric Malle', concentration: 'Eau de Parfum', release_year: 2000, longevity: 10, projection: 8, description: 'Lavender and bergamot opening into musk, vanilla and amber. Deeply sensual.' },

  // ── LE LABO ───────────────────────────────────────────────────
  { name: 'Santal 33', brand: 'Le Labo', concentration: 'Eau de Parfum', release_year: 2011, longevity: 8, projection: 7, description: 'Sandalwood, cedar, cardamom and leather. The cult fragrance of a generation.' },
  { name: 'Rose 31', brand: 'Le Labo', concentration: 'Eau de Parfum', release_year: 2006, longevity: 8, projection: 7, description: 'Dry spicy rose with cumin, guaiac wood and oud. Rose for the unconventional.' },
  { name: 'Another 13', brand: 'Le Labo', concentration: 'Eau de Parfum', release_year: 2010, longevity: 8, projection: 7, description: 'Ambroxan and musk with apple blossom. Transparent and addictive.' },
  { name: 'Noir 29', brand: 'Le Labo', concentration: 'Eau de Parfum', release_year: 2006, longevity: 9, projection: 7, description: 'Dark fig, smoky wood and musk. Urban and introspective.' },

  // ── BYREDO ────────────────────────────────────────────────────
  { name: 'Gypsy Water', brand: 'Byredo', concentration: 'Eau de Parfum', release_year: 2008, longevity: 7, projection: 6, description: 'Bergamot, juniper, sandalwood and vanilla. Fresh, clean and nomadic.' },
  { name: 'Bal d\'Afrique', brand: 'Byredo', concentration: 'Eau de Parfum', release_year: 2009, longevity: 8, projection: 7, description: 'Moroccan cedarwood, violet and African marigold. Warm and vibrant.' },
  { name: 'Bibliothèque', brand: 'Byredo', concentration: 'Eau de Parfum', release_year: 2014, longevity: 8, projection: 7, description: 'Peach, plum and vanilla with leather and wood. Old books and warmth.' },
  { name: 'Mojave Ghost', brand: 'Byredo', concentration: 'Eau de Parfum', release_year: 2014, longevity: 8, projection: 7, description: 'Desert-dry ambrette, magnolia and violet. Ghostly and alluring.' },

  // ── DIPTYQUE ─────────────────────────────────────────────────
  { name: 'Philosykos', brand: 'Diptyque', concentration: 'Eau de Parfum', release_year: 1996, longevity: 7, projection: 6, description: 'Fig tree — bark, leaves and fruit. Natural, creamy and contemplative.' },
  { name: 'Tam Dao', brand: 'Diptyque', concentration: 'Eau de Parfum', release_year: 2003, longevity: 8, projection: 7, description: 'Sandalwood, cypress and cedarwood. Clean woody minimalism.' },
  { name: 'Eau Rose', brand: 'Diptyque', concentration: 'Eau de Toilette', release_year: 2011, longevity: 6, projection: 6, description: 'Fresh, watery rose with litchi and musk. Easy to wear and beautiful.' },
  { name: 'Oud Palao', brand: 'Diptyque', concentration: 'Eau de Parfum', release_year: 2015, longevity: 9, projection: 8, description: 'Smoky oud with rose and patchouli. Rich but balanced.' },
  { name: 'Do Son', brand: 'Diptyque', concentration: 'Eau de Toilette', release_year: 2005, longevity: 7, projection: 6, description: 'Tuberose, white rose and musks. Sheer, delicate femininity.' },

  // ── JO MALONE ────────────────────────────────────────────────
  { name: 'Wood Sage & Sea Salt', brand: 'Jo Malone', concentration: 'Cologne', release_year: 2014, longevity: 5, projection: 5, description: 'Sea salt, sage and driftwood. Captures the English coast.' },
  { name: 'Peony & Blush Suede', brand: 'Jo Malone', concentration: 'Cologne', release_year: 2013, longevity: 6, projection: 6, description: 'Peony, blush suede and red apple. Feminine and luxurious.' },
  { name: 'Lime Basil & Mandarin', brand: 'Jo Malone', concentration: 'Cologne', release_year: 1999, longevity: 5, projection: 5, description: 'Peppery basil, white thyme and lime. The Jo Malone signature.' },
  { name: 'Blackberry & Bay', brand: 'Jo Malone', concentration: 'Cologne', release_year: 2013, longevity: 5, projection: 5, description: 'Wild blackberry, bay and cedar. Fresh and British.' },

  // ── PENHALIGON'S ─────────────────────────────────────────────
  { name: 'Halfeti', brand: 'Penhaligon\'s', concentration: 'Eau de Parfum', release_year: 2016, longevity: 9, projection: 8, description: 'Inspired by the drowned Turkish village. Rose, oud and patchouli.' },
  { name: 'The Tragedy of Lord George', brand: 'Penhaligon\'s', concentration: 'Eau de Parfum', release_year: 2019, longevity: 9, projection: 8, description: 'Smoke, leather and tobacco. Eccentric and deeply British.' },

  // ── XERJOFF ──────────────────────────────────────────────────
  { name: 'Naxos', brand: 'Xerjoff', concentration: 'Eau de Parfum', release_year: 2013, longevity: 10, projection: 9, description: 'Lavender, honey, tobacco and vanilla. Possibly the greatest lavender fragrance ever made.' },
  { name: 'Irina', brand: 'Xerjoff', concentration: 'Eau de Parfum', release_year: 2013, longevity: 9, projection: 8, description: 'White florals with peony, musk and cedarwood. Elegant femininity.' },
  { name: 'Alexandria II', brand: 'Xerjoff', concentration: 'Eau de Parfum', release_year: 2016, longevity: 10, projection: 9, description: 'Rose, oud, vanilla and sandalwood. Opulent and majestic.' },

  // ── PARFUMS DE MARLY ─────────────────────────────────────────
  { name: 'Layton', brand: 'Parfums de Marly', concentration: 'Eau de Parfum', release_year: 2016, longevity: 10, projection: 9, description: 'Apple, lavender, vanilla and sandalwood. The crowd-pleaser of the niche world.' },
  { name: 'Herod', brand: 'Parfums de Marly', concentration: 'Eau de Parfum', release_year: 2012, longevity: 10, projection: 8, description: 'Cinnamon-spiced tobacco with vanilla and pepper. Rich and intense.' },
  { name: 'Pegasus', brand: 'Parfums de Marly', concentration: 'Eau de Parfum', release_year: 2011, longevity: 9, projection: 8, description: 'Sweet almond heliotrope and vanilla with bergamot.' },
  { name: 'Delina', brand: 'Parfums de Marly', concentration: 'Eau de Parfum', release_year: 2017, longevity: 9, projection: 9, description: 'Turkish rose, lychee, rhubarb and white musk. The niche rose masterpiece.' },
  { name: 'Valaya', brand: 'Parfums de Marly', concentration: 'Eau de Parfum', release_year: 2022, longevity: 9, projection: 8, description: 'Fig, jasmine and sandalwood. Luxurious and Mediterranean.' },

  // ── MANCERA ──────────────────────────────────────────────────
  { name: 'Cedrat Boise', brand: 'Mancera', concentration: 'Eau de Parfum', release_year: 2011, longevity: 9, projection: 9, description: 'Fresh lemon citrus on a dark patchouli and leather base. Bold versatility.' },
  { name: 'Red Tobacco', brand: 'Mancera', concentration: 'Eau de Parfum', release_year: 2016, longevity: 9, projection: 9, description: 'Rich tobacco, cinnamon and vanilla with bergamot. A powerful crowd-pleaser.' },
  { name: 'Aoud Exclusif', brand: 'Mancera', concentration: 'Eau de Parfum', release_year: 2016, longevity: 10, projection: 9, description: 'Saffron, rose and oud. Sophisticated Middle Eastern inspiration.' },
  { name: 'Roses Vanille', brand: 'Mancera', concentration: 'Eau de Parfum', release_year: 2013, longevity: 9, projection: 8, description: 'Rose, jasmine and vanilla gourmand. Warm and comforting.' },

  // ── MAISON MARGIELA ──────────────────────────────────────────
  { name: 'Replica: Jazz Club', brand: 'Maison Margiela', concentration: 'Eau de Toilette', release_year: 2013, longevity: 7, projection: 6, description: 'Vetiver, tobacco and rum. Like being in a late-night jazz bar.' },
  { name: 'Replica: Flower Market', brand: 'Maison Margiela', concentration: 'Eau de Toilette', release_year: 2013, longevity: 7, projection: 6, description: 'Peony, rose, freesia and musk. Fresh flowers at dawn.' },
  { name: 'Replica: By the Fireplace', brand: 'Maison Margiela', concentration: 'Eau de Toilette', release_year: 2015, longevity: 8, projection: 6, description: 'Chestnut, guaiac smoke and vanilla. The cosiness of a fireplace in winter.' },
  { name: 'Replica: Sailing Day', brand: 'Maison Margiela', concentration: 'Eau de Toilette', release_year: 2014, longevity: 6, projection: 6, description: 'Sea spray, driftwood and cedar. A day on the open water.' },

  // ── ESCENTRIC MOLECULES ───────────────────────────────────────
  { name: 'Molecule 01', brand: 'Escentric Molecules', concentration: 'Eau de Toilette', release_year: 2006, longevity: 8, projection: 5, description: 'Pure Iso E Super — a skin-amplifying cedarwood molecule unique to each wearer.' },
  { name: 'Molecule 02', brand: 'Escentric Molecules', concentration: 'Eau de Toilette', release_year: 2008, longevity: 7, projection: 5, description: 'Pure Ambroxan — a warm, sensual skin scent that evolves differently on everyone.' },

  // ── INITIO ────────────────────────────────────────────────────
  { name: 'Oud for Greatness', brand: 'Initio', concentration: 'Eau de Parfum', release_year: 2018, longevity: 10, projection: 9, description: 'Smoky oud, nutmeg and musk. Commanding and opulent.' },
  { name: 'Absolute Aphrodisiac', brand: 'Initio', concentration: 'Eau de Parfum', release_year: 2015, longevity: 9, projection: 8, description: 'Vanilla, tonka and musk. Sensual and irresistibly skin-close.' },
  { name: 'Psychedelic Love', brand: 'Initio', concentration: 'Eau de Parfum', release_year: 2019, longevity: 9, projection: 8, description: 'Benzyl salicylate, rose and orris. Dreamy and euphoric.' },

  // ── NISHANE ───────────────────────────────────────────────────
  { name: 'Hacivat', brand: 'Nishane', concentration: 'Extrait de Parfum', release_year: 2016, longevity: 10, projection: 9, description: 'Pineapple, grapefruit and patchouli on a birchwood base. Premium fruity chypre.' },
  { name: 'Ani', brand: 'Nishane', concentration: 'Extrait de Parfum', release_year: 2018, longevity: 10, projection: 9, description: 'Bergamot, raspberry and rose with sandalwood. Rich, complex beauty.' },
  { name: 'Fan Your Flames', brand: 'Nishane', concentration: 'Extrait de Parfum', release_year: 2017, longevity: 10, projection: 8, description: 'Saffron, rose and oud. Luxurious Middle Eastern-inspired artistry.' },

  // ── ROJA DOVE ────────────────────────────────────────────────
  { name: 'Elysium', brand: 'Roja Dove', concentration: 'Parfum Cologne', release_year: 2017, longevity: 9, projection: 8, description: 'Energising grapefruit, bergamot and sandalwood. Accessible Roja luxury.' },
  { name: 'Scandal', brand: 'Roja Dove', concentration: 'Eau de Parfum', release_year: 2010, longevity: 10, projection: 9, description: 'Outrageously floral and animalic with rose, civet and amber. Extravagant decadence.' },
  { name: 'Enigma', brand: 'Roja Dove', concentration: 'Parfum', release_year: 2012, longevity: 10, projection: 9, description: 'Oud, jasmine and leather on a rich amber base. Sophisticated and commanding.' },

  // ── NASOMATTO ────────────────────────────────────────────────
  { name: 'Black Afgano', brand: 'Nasomatto', concentration: 'Extrait de Parfum', release_year: 2009, longevity: 10, projection: 8, description: 'Cannabis, hashish and oud. Dark, resinous and deeply hypnotic.' },
  { name: 'Narcotic Venus', brand: 'Nasomatto', concentration: 'Extrait de Parfum', release_year: 2011, longevity: 9, projection: 7, description: 'Gardenia absolute and musk. Intoxicating white floral femininity.' },

  // ── LOUIS VUITTON ────────────────────────────────────────────
  { name: 'Ombre Nomade', brand: 'Louis Vuitton', concentration: 'Eau de Parfum', release_year: 2018, longevity: 10, projection: 9, description: 'Powerful oud with rose, benzoin and woods. One of the great modern oud fragrances.' },
  { name: 'Mille Feux', brand: 'Louis Vuitton', concentration: 'Eau de Parfum', release_year: 2017, longevity: 9, projection: 8, description: 'Smoky plum, saffron and iris on a sandalwood and amber base.' },
  { name: 'Imagination', brand: 'Louis Vuitton', concentration: 'Eau de Toilette', release_year: 2021, longevity: 7, projection: 7, description: 'Mandarin, vetiver and patchouli. Clean, versatile and sophisticated.' },

  // ── LALIQUE ──────────────────────────────────────────────────
  { name: 'Encre Noire', brand: 'Lalique', concentration: 'Eau de Toilette', release_year: 2006, longevity: 9, projection: 8, description: 'Pure vetiver dominance — dark, earthy and profoundly masculine.' },

  // ── PACO RABANNE ─────────────────────────────────────────────
  { name: '1 Million', brand: 'Paco Rabanne', concentration: 'Eau de Toilette', release_year: 2008, longevity: 8, projection: 9, description: 'Blood mandarin, rose and cinnamon on patchouli and leather. The golden scent of success.' },
  { name: 'Invictus', brand: 'Paco Rabanne', concentration: 'Eau de Toilette', release_year: 2013, longevity: 7, projection: 8, description: 'Aquatic grapefruit, guaiac wood and ambergris. The champion\'s fragrance.' },
  { name: '1 Million Lucky', brand: 'Paco Rabanne', concentration: 'Eau de Toilette', release_year: 2018, longevity: 7, projection: 7, description: 'Hazelnut, plum and patchouli. A softer, more charming take on the original.' },

  // ── VERSACE ──────────────────────────────────────────────────
  { name: 'Eros', brand: 'Versace', concentration: 'Eau de Toilette', release_year: 2012, longevity: 8, projection: 9, description: 'Explosive mint, green apple and vanilla. Highly complimented and youthful.' },
  { name: 'Dylan Blue', brand: 'Versace', concentration: 'Eau de Parfum', release_year: 2016, longevity: 8, projection: 8, description: 'Aquatic fougere with fig leaf, violet and musk. Elegant and versatile.' },

  // ── VIKTOR & ROLF ────────────────────────────────────────────
  { name: 'Spicebomb', brand: 'Viktor & Rolf', concentration: 'Eau de Toilette', release_year: 2012, longevity: 8, projection: 8, description: 'Explosive blend of tabasco, saffron, tobacco and leather. Made for cold nights.' },
  { name: 'Flowerbomb', brand: 'Viktor & Rolf', concentration: 'Eau de Parfum', release_year: 2005, longevity: 9, projection: 8, description: 'An explosion of rose, jasmine, freesia and patchouli. A modern feminine icon.' },

  // ── HERMÈS ───────────────────────────────────────────────────
  { name: 'Terre d\'Hermès', brand: 'Hermès', concentration: 'Eau de Toilette', release_year: 2006, longevity: 8, projection: 8, description: 'Earthy mineral with orange peel, pepper and vetiver. Jean-Claude Ellena\'s masterpiece.' },
  { name: 'Voyage d\'Hermès', brand: 'Hermès', concentration: 'Eau de Toilette', release_year: 2010, longevity: 7, projection: 7, description: 'Airy mineral freshness with ambergris, cedar and white musk.' },
  { name: 'H24', brand: 'Hermès', concentration: 'Eau de Toilette', release_year: 2021, longevity: 7, projection: 7, description: 'Sage, clary sage and sclarene. Green aromatic freshness for the modern man.' },

  // ── THIERRY MUGLER ───────────────────────────────────────────
  { name: 'Alien', brand: 'Thierry Mugler', concentration: 'Eau de Parfum', release_year: 2005, longevity: 10, projection: 9, description: 'Otherworldly white floral with amber and cashmeran. Polarising and unforgettable.' },
  { name: 'Angel', brand: 'Thierry Mugler', concentration: 'Eau de Parfum', release_year: 1992, longevity: 10, projection: 10, description: 'The godmother of gourmand fragrances. Patchouli, chocolate, vanilla and caramel.' },
  { name: 'A*Men', brand: 'Thierry Mugler', concentration: 'Eau de Toilette', release_year: 1996, longevity: 9, projection: 8, description: 'Caramel, coffee, tar and patchouli. The masculine counterpart to Angel.' },

  // ── DOLCE & GABBANA ──────────────────────────────────────────
  { name: 'The One', brand: 'Dolce & Gabbana', concentration: 'Eau de Toilette', release_year: 2008, longevity: 7, projection: 7, description: 'Warm tobacco, amber and ginger. Sophistication in a bottle.' },
  { name: 'Light Blue', brand: 'Dolce & Gabbana', concentration: 'Eau de Toilette', release_year: 2001, longevity: 5, projection: 5, description: 'Mediterranean freshness with Sicilian citrus and apple. A perennial summer staple.' },

  // ── LANCÔME ──────────────────────────────────────────────────
  { name: 'La Vie est Belle', brand: 'Lancôme', concentration: 'Eau de Parfum', release_year: 2012, longevity: 9, projection: 7, description: 'Iris, praline and patchouli. The world\'s best-selling feminine fragrance.' },
  { name: 'Idôle', brand: 'Lancôme', concentration: 'Eau de Parfum', release_year: 2019, longevity: 7, projection: 7, description: 'Clean rose and jasmine on sandalwood and musks. Modern and aspirational.' },

  // ── CAROLINA HERRERA ─────────────────────────────────────────
  { name: 'Good Girl', brand: 'Carolina Herrera', concentration: 'Eau de Parfum', release_year: 2016, longevity: 9, projection: 9, description: 'Jasmine and tonka bean — duality of innocence and temptation.' },
  { name: 'Bad Boy', brand: 'Carolina Herrera', concentration: 'Eau de Toilette', release_year: 2019, longevity: 8, projection: 8, description: 'Coffee, bergamot and elemi with vetiver. Energetic and seductive.' },

  // ── PRADA ────────────────────────────────────────────────────
  { name: 'Luna Rossa Black', brand: 'Prada', concentration: 'Eau de Parfum', release_year: 2018, longevity: 9, projection: 8, description: 'Iris, patchouli and amber. Cold darkness distilled.' },
  { name: 'L\'Homme Prada', brand: 'Prada', concentration: 'Eau de Toilette', release_year: 2016, longevity: 7, projection: 7, description: 'Iris, neroli and amber. Elegant Italian masculinity.' },
  { name: 'Candy', brand: 'Prada', concentration: 'Eau de Parfum', release_year: 2011, longevity: 8, projection: 7, description: 'Caramel, benzoin and musks. Addictively sweet femininity.' },

  // ── HUGO BOSS ────────────────────────────────────────────────
  { name: 'Boss Bottled', brand: 'Hugo Boss', concentration: 'Eau de Toilette', release_year: 1998, longevity: 7, projection: 7, description: 'Apple, cinnamon and sandalwood. The reliable gentleman\'s office fragrance.' },
  { name: 'Hugo', brand: 'Hugo Boss', concentration: 'Eau de Toilette', release_year: 1995, longevity: 6, projection: 7, description: 'Energetic green spearmint and citrus. A defining 90s scent.' },

  // ── GIVENCHY ────────────────────────────────────────────────
  { name: 'Gentleman', brand: 'Givenchy', concentration: 'Eau de Parfum', release_year: 2017, longevity: 8, projection: 7, description: 'Patchouli and iris with a touch of leather accord. Modern refinement.' },
  { name: 'L\'Interdit', brand: 'Givenchy', concentration: 'Eau de Parfum', release_year: 2018, longevity: 8, projection: 8, description: 'White florals with vetiver and patchouli. Forbidden and seductive.' },

  // ── RALPH LAUREN ────────────────────────────────────────────
  { name: 'Polo Black', brand: 'Ralph Lauren', concentration: 'Eau de Toilette', release_year: 2005, longevity: 7, projection: 8, description: 'Mango, sandalwood and tarragon. Night-time confidence.' },
  { name: 'Polo Blue', brand: 'Ralph Lauren', concentration: 'Eau de Toilette', release_year: 2003, longevity: 6, projection: 7, description: 'Melon, sage and suede. A fresh, clean American classic.' },

  // ── BURBERRY ────────────────────────────────────────────────
  { name: 'Hero', brand: 'Burberry', concentration: 'Eau de Parfum', release_year: 2022, longevity: 9, projection: 8, description: 'Cedar, juniper and bergamot. Strong and confident modern masculinity.' },
  { name: 'Her', brand: 'Burberry', concentration: 'Eau de Parfum', release_year: 2018, longevity: 8, projection: 7, description: 'Red berries, jasmine and amber. A contemporary London floral.' },

  // ── AZZARO ───────────────────────────────────────────────────
  { name: 'Chrome', brand: 'Azzaro', concentration: 'Eau de Toilette', release_year: 1996, longevity: 6, projection: 7, description: 'Fresh metallic aquatic with bergamot, rosemary and oakmoss.' },
  { name: 'Wanted', brand: 'Azzaro', concentration: 'Eau de Toilette', release_year: 2016, longevity: 7, projection: 8, description: 'Cardamom, vetiver and lemon. Western woody freshness.' },

  // ── GUCCI ────────────────────────────────────────────────────
  { name: 'Guilty', brand: 'Gucci', concentration: 'Eau de Toilette', release_year: 2010, longevity: 7, projection: 7, description: 'Pink pepper, geranium and amber. Guilt-free modern pleasure.' },
  { name: 'Bloom', brand: 'Gucci', concentration: 'Eau de Parfum', release_year: 2017, longevity: 8, projection: 7, description: 'Jasmine, tuberose and Rangoon creeper. Bold, full white florals.' },
  { name: 'Mémoire d\'une Odeur', brand: 'Gucci', concentration: 'Eau de Parfum', release_year: 2019, longevity: 8, projection: 7, description: 'Indian coral jasmine, chamomile and musks. Gender-neutral and dreamy.' },

  // ── ISSEY MIYAKE ─────────────────────────────────────────────
  { name: 'L\'Eau d\'Issey Pour Homme', brand: 'Issey Miyake', concentration: 'Eau de Toilette', release_year: 1994, longevity: 6, projection: 6, description: 'Aquatic yuzu, calone and vetiver. Revolutionary when launched, still timeless.' },
  { name: 'L\'Eau d\'Issey', brand: 'Issey Miyake', concentration: 'Eau de Toilette', release_year: 1992, longevity: 6, projection: 6, description: 'Fresh aquatic floral with lotus, freesia and musk.' },

  // ── MONTBLANC ────────────────────────────────────────────────
  { name: 'Explorer', brand: 'Montblanc', concentration: 'Eau de Parfum', release_year: 2019, longevity: 8, projection: 8, description: 'Bergamot, vetiver and Ambroxan. Accessible luxury that punches well above its price.' },
  { name: 'Legend', brand: 'Montblanc', concentration: 'Eau de Toilette', release_year: 2011, longevity: 7, projection: 7, description: 'Fresh fougere with lavender, oakmoss and sandalwood. Timeless and versatile.' },

  // ── MARC JACOBS ──────────────────────────────────────────────
  { name: 'Daisy', brand: 'Marc Jacobs', concentration: 'Eau de Toilette', release_year: 2007, longevity: 6, projection: 6, description: 'Violet, jasmine and white musk. Innocently feminine and universally loved.' },
]

export async function POST(request: Request) {
  // Require service key at runtime — never stored in code
  const serviceKey = request.headers.get('x-service-key')
  const seedSecret = request.headers.get('x-seed-secret')

  if (!serviceKey || seedSecret !== 'fv-seed-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    )

    // Fetch all existing fragrances
    const { data: existing, error: fetchErr } = await supabase
      .from('fragrances')
      .select('name, brand, concentration')

    if (fetchErr) throw fetchErr

    // Build a set of existing keys for deduplication
    const existingKeys = new Set(
      (existing ?? []).map((f: { name: string; brand: string; concentration: string }) =>
        `${f.brand.toLowerCase()}||${f.name.toLowerCase()}||${(f.concentration ?? '').toLowerCase()}`
      )
    )

    // Filter to new-only
    const toInsert = FRAGRANCES.filter(f => {
      const key = `${f.brand.toLowerCase()}||${f.name.toLowerCase()}||${(f.concentration ?? '').toLowerCase()}`
      return !existingKeys.has(key)
    })

    if (toInsert.length === 0) {
      return NextResponse.json({
        message: 'Nothing to insert — all fragrances already exist',
        existing: existing?.length ?? 0,
        inserted: 0,
      })
    }

    // Bulk insert in batches of 50
    let insertedCount = 0
    const batchSize = 50
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize)
      const { error: insertErr } = await supabase.from('fragrances').insert(batch)
      if (insertErr) throw insertErr
      insertedCount += batch.length
    }

    return NextResponse.json({
      message: 'Seed complete',
      previously_existing: existing?.length ?? 0,
      inserted: insertedCount,
      total_after: (existing?.length ?? 0) + insertedCount,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
