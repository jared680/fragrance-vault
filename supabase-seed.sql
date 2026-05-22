-- ============================================
-- FRAGRANCE VAULT — SEED DATA
-- Run AFTER schema in: Supabase SQL Editor
-- ============================================

-- Insert fragrances
INSERT INTO fragrances (id, name, brand, concentration, release_year, longevity, projection, description) VALUES
('f001', 'Sauvage', 'Dior', 'Eau de Toilette', 2015, 9, 8, 'Fresh, woody aromatic with bergamot and Ambroxan'),
('f002', 'Sauvage', 'Dior', 'Eau de Parfum', 2018, 10, 7, 'Deeper, spicier version with lavender and vanilla'),
('f003', 'Bleu de Chanel', 'Chanel', 'Eau de Parfum', 2010, 8, 7, 'Clean, woody aromatic with citrus and incense'),
('f004', 'Bleu de Chanel', 'Chanel', 'Parfum', 2018, 10, 7, 'Rich and woody with sandalwood and cedar'),
('f005', 'Acqua di Gio', 'Giorgio Armani', 'Eau de Toilette', 1996, 6, 6, 'Classic Mediterranean aquatic fragrance'),
('f006', 'Acqua di Gio Profumo', 'Giorgio Armani', 'Parfum', 2015, 9, 7, 'Darker aquatic with incense and patchouli'),
('f007', 'Aventus', 'Creed', 'Eau de Parfum', 2010, 9, 8, 'Iconic fruity chypre with pineapple and birch'),
('f008', 'Silver Mountain Water', 'Creed', 'Eau de Parfum', 1995, 8, 7, 'Fresh metallic green tea and blackcurrant'),
('f009', 'La Nuit de L''Homme', 'Yves Saint Laurent', 'Eau de Toilette', 2009, 7, 7, 'Seductive cardamom, cedar and lavender'),
('f010', 'Y', 'Yves Saint Laurent', 'Eau de Parfum', 2018, 8, 8, 'Bold fresh-spicy with sage and bergamot'),
('f011', 'One Million', 'Paco Rabanne', 'Eau de Toilette', 2008, 8, 9, 'Spicy, sweet gold with cinnamon and grapefruit'),
('f012', 'Invictus', 'Paco Rabanne', 'Eau de Toilette', 2013, 7, 8, 'Aquatic woody with grapefruit and guaiac wood'),
('f013', 'Fahrenheit', 'Dior', 'Eau de Toilette', 1988, 9, 8, 'Unique gasoline-floral with violet and cedar'),
('f014', 'L''Homme', 'Yves Saint Laurent', 'Eau de Parfum', 2016, 8, 7, 'Refined ginger, cedar and white pepper'),
('f015', 'Eros', 'Versace', 'Eau de Toilette', 2012, 8, 9, 'Fresh minty green with vanilla and cedar'),
('f016', 'Dylan Blue', 'Versace', 'Eau de Parfum', 2016, 8, 8, 'Aquatic fougere with fig and musk'),
('f017', 'The One', 'Dolce & Gabbana', 'Eau de Toilette', 2008, 7, 7, 'Warm tobacco, amber and ginger'),
('f018', 'Light Blue', 'Dolce & Gabbana', 'Eau de Toilette', 2001, 5, 5, 'Mediterranean citrus and apple freshness'),
('f019', 'Terre d''Hermès', 'Hermès', 'Eau de Toilette', 2006, 8, 8, 'Earthy mineral with orange peel and vetiver'),
('f020', 'Voyage d''Hermès', 'Hermès', 'Eau de Toilette', 2010, 7, 7, 'Airy mineral freshness with cedar and white musk'),
('f021', 'Dior Homme Intense', 'Dior', 'Eau de Parfum', 2007, 9, 7, 'Powdery iris with lavender and patchouli'),
('f022', 'Polo Black', 'Ralph Lauren', 'Eau de Toilette', 2005, 7, 8, 'Aromatic fruity with mango and sandalwood'),
('f023', 'Polo Blue', 'Ralph Lauren', 'Eau de Toilette', 2003, 6, 7, 'Melon aquatic with suede and musk'),
('f024', 'Chrome', 'Azzaro', 'Eau de Toilette', 1996, 6, 7, 'Fresh metallic aquatic with bergamot and oakmoss'),
('f025', 'Wanted', 'Azzaro', 'Eau de Toilette', 2016, 7, 8, 'Spicy woody with cardamom and vetiver'),
('f026', 'Allure Homme Sport', 'Chanel', 'Eau de Toilette', 2004, 7, 7, 'Fresh sporty with cedar and white musk'),
('f027', 'Gentleman', 'Givenchy', 'Eau de Parfum', 2017, 8, 7, 'Patchouli and iris with leather accord'),
('f028', 'Pi', 'Givenchy', 'Eau de Toilette', 1998, 7, 7, 'Warm anise, tonka and vanilla'),
('f029', 'Spicebomb', 'Viktor & Rolf', 'Eau de Toilette', 2012, 8, 8, 'Explosive spices with tobacco and leather'),
('f030', 'Flowerbomb', 'Viktor & Rolf', 'Eau de Parfum', 2005, 9, 8, 'Floral explosion with rose, jasmine and patchouli'),
('f031', 'La Vie est Belle', 'Lancôme', 'Eau de Parfum', 2012, 9, 7, 'Gourmand iris with praline and vanilla'),
('f032', 'Miss Dior', 'Dior', 'Eau de Parfum', 2017, 8, 7, 'Floral chypre with rose and patchouli'),
('f033', 'Coco Mademoiselle', 'Chanel', 'Eau de Parfum', 2001, 8, 8, 'Fresh oriental with orange and vetiver'),
('f034', 'Chance', 'Chanel', 'Eau de Parfum', 2002, 7, 7, 'Round floral with jasmine, white musks'),
('f035', 'N°5', 'Chanel', 'Eau de Parfum', 1921, 8, 7, 'Iconic floral aldehyde with jasmine and rose'),
('f036', 'Black Opium', 'Yves Saint Laurent', 'Eau de Parfum', 2014, 9, 8, 'Coffee, vanilla and white floral'),
('f037', 'Mon Paris', 'Yves Saint Laurent', 'Eau de Parfum', 2016, 8, 8, 'Strawberry and peony with patchouli'),
('f038', 'Si', 'Giorgio Armani', 'Eau de Parfum', 2013, 8, 7, 'Blackcurrant and vanilla with rose'),
('f039', 'My Way', 'Giorgio Armani', 'Eau de Parfum', 2020, 8, 7, 'Tuberose and bergamot with cedarwood'),
('f040', 'Alien', 'Thierry Mugler', 'Eau de Parfum', 2005, 10, 9, 'Otherworldly white floral with amber and cashmeran'),
('f041', 'Angel', 'Thierry Mugler', 'Eau de Parfum', 1992, 10, 10, 'Iconic gourmand with patchouli, chocolate and vanilla'),
('f042', 'Hypnotic Poison', 'Dior', 'Eau de Toilette', 1998, 8, 8, 'Almond, vanilla and jasmine, dark and addictive'),
('f043', 'J''adore', 'Dior', 'Eau de Parfum', 1999, 8, 8, 'Luminous floral with ylang-ylang and rose'),
('f044', 'Idôle', 'Lancôme', 'Eau de Parfum', 2019, 7, 7, 'Clean rose with sandalwood and musks'),
('f045', 'Good Girl', 'Carolina Herrera', 'Eau de Parfum', 2016, 9, 9, 'Dual nature jasmine and tonka bean'),
('f046', 'Very Good Girl', 'Carolina Herrera', 'Eau de Parfum', 2021, 8, 8, 'Red fruits and rose with vetiver'),
('f047', 'Libre', 'Yves Saint Laurent', 'Eau de Parfum', 2019, 9, 8, 'Lavender and orange blossom with vanilla'),
('f048', 'Daisy', 'Marc Jacobs', 'Eau de Toilette', 2007, 6, 6, 'Soft floral with wild berries and musk'),
('f049', 'Oud Wood', 'Tom Ford', 'Eau de Parfum', 2007, 9, 7, 'Rare oud with rosewood and sandalwood'),
('f050', 'Black Orchid', 'Tom Ford', 'Eau de Parfum', 2006, 9, 8, 'Dark floral oriental with truffle and orchid'),
('f051', 'Tobacco Vanille', 'Tom Ford', 'Eau de Parfum', 2007, 10, 8, 'Rich tobacco with vanilla and tonka'),
('f052', 'Neroli Portofino', 'Tom Ford', 'Eau de Parfum', 2011, 7, 7, 'Fresh Mediterranean neroli and citrus'),
('f053', 'Lost Cherry', 'Tom Ford', 'Eau de Parfum', 2018, 9, 8, 'Dark cherry, almond and tonka'),
('f054', 'Baccarat Rouge 540', 'Maison Francis Kurkdjian', 'Eau de Parfum', 2015, 10, 9, 'Luminous amber and saffron with cedarwood'),
('f055', 'Gentle Fluidity Gold', 'Maison Francis Kurkdjian', 'Eau de Parfum', 2019, 9, 7, 'Nutmeg, vanilla and musk accord'),
('f056', 'Portrait of a Lady', 'Frédéric Malle', 'Eau de Parfum', 2010, 10, 9, 'Magnificent rose with patchouli and incense'),
('f057', 'Carnal Flower', 'Frédéric Malle', 'Eau de Parfum', 2005, 9, 8, 'Indolic tuberose, absolute and musk'),
('f058', 'Santal 33', 'Le Labo', 'Eau de Parfum', 2011, 8, 7, 'Cult woody sandalwood with cardamom and cedarwood'),
('f059', 'Rose 31', 'Le Labo', 'Eau de Parfum', 2006, 8, 7, 'Dry spicy rose with cumin and oud'),
('f060', 'Another 13', 'Le Labo', 'Eau de Parfum', 2010, 8, 7, 'Ambroxan and musk with apple blossom'),
('f061', 'Molecule 01', 'Escentric Molecules', 'Eau de Toilette', 2006, 8, 5, 'Pure Iso E Super — skin-amplifying cedarwood'),
('f062', 'Molecule 02', 'Escentric Molecules', 'Eau de Toilette', 2008, 7, 5, 'Pure Ambroxan — unique skin scent'),
('f063', 'Florabotanica', 'Balenciaga', 'Eau de Parfum', 2012, 7, 7, 'Rose and cannabis with vetiver'),
('f064', 'Ombre Nomade', 'Louis Vuitton', 'Eau de Parfum', 2018, 10, 9, 'Powerful oud with rose and benzoin'),
('f065', 'Mille Feux', 'Louis Vuitton', 'Eau de Parfum', 2017, 9, 8, 'Smoky plum with iris and sandalwood'),
('f066', 'Encre Noire', 'Lalique', 'Eau de Toilette', 2006, 9, 8, 'Pure vetiver power — dark and striking'),
('f067', 'Amouage Reflection Man', 'Amouage', 'Eau de Parfum', 2007, 9, 8, 'Refined white floral with neroli and sandalwood'),
('f068', 'Amouage Interlude Man', 'Amouage', 'Eau de Parfum', 2012, 10, 9, 'Resinous incense with oud and smoke'),
('f069', 'Fahrenheit Absolute', 'Dior', 'Eau de Parfum', 2009, 9, 8, 'Warmer violet and cedar with leather'),
('f070', 'Tuscan Leather', 'Tom Ford', 'Eau de Parfum', 2007, 9, 8, 'Raw leather and raspberries'),
('f071', 'Wonderoud', 'Mancera', 'Eau de Parfum', 2018, 9, 8, 'Powdery oud with rose and sandalwood'),
('f072', 'Red Tobacco', 'Mancera', 'Eau de Parfum', 2016, 9, 9, 'Rich tobacco and vanilla with bergamot'),
('f073', 'Cedrat Boise', 'Mancera', 'Eau de Parfum', 2011, 9, 9, 'Fresh citrus on a dark woody base'),
('f074', 'Layton', 'Parfums de Marly', 'Eau de Parfum', 2016, 10, 9, 'Apple, vanilla and sandalwood masterpiece'),
('f075', 'Herod', 'Parfums de Marly', 'Eau de Parfum', 2012, 10, 8, 'Cinnamon-spiced tobacco with vanilla'),
('f076', 'Pegasus', 'Parfums de Marly', 'Eau de Parfum', 2011, 9, 8, 'Sweet almond heliotrope and vanilla'),
('f077', 'Delina', 'Parfums de Marly', 'Eau de Parfum', 2017, 9, 9, 'Turkish rose and lychee with musk'),
('f078', 'Naxos', 'Xerjoff', 'Eau de Parfum', 2013, 10, 9, 'Lavender, honey and tobacco on vanilla'),
('f079', 'Irina', 'Xerjoff', 'Eau de Parfum', 2013, 9, 8, 'White floral with peony and musk'),
('f080', 'Grand Soir', 'Maison Margiela', 'Eau de Parfum', 2017, 9, 7, 'Amber Oriental with tonka and benzoin');

-- ============================================
-- FRAGRANCE TAGS (seasons + occasions)
-- ============================================
INSERT INTO fragrance_tags (fragrance_id, season, occasion) VALUES
-- Sauvage EDT
('f001', 'Spring', 'Casual'), ('f001', 'Summer', 'Casual'), ('f001', 'Summer', 'Office'),
-- Sauvage EDP
('f002', 'Autumn', 'Date Night'), ('f002', 'Spring', 'Casual'),
-- Bleu de Chanel EDP
('f003', 'Spring', 'Office'), ('f003', 'Autumn', 'Formal'), ('f003', 'Summer', 'Office'),
-- Acqua di Gio
('f005', 'Summer', 'Casual'), ('f005', 'Spring', 'Casual'), ('f005', 'Summer', 'Beach'),
-- Acqua di Gio Profumo
('f006', 'Autumn', 'Date Night'), ('f006', 'Summer', 'Evening'),
-- Aventus
('f007', 'Autumn', 'Formal'), ('f007', 'Spring', 'Office'), ('f007', 'Autumn', 'Date Night'),
-- La Nuit de LHomme
('f009', 'Autumn', 'Date Night'), ('f009', 'Winter', 'Date Night'), ('f009', 'Winter', 'Evening'),
-- One Million
('f011', 'Autumn', 'Evening'), ('f011', 'Winter', 'Date Night'),
-- Invictus
('f012', 'Spring', 'Sport'), ('f012', 'Summer', 'Casual'), ('f012', 'Summer', 'Beach'),
-- Eros
('f015', 'Spring', 'Casual'), ('f015', 'Summer', 'Date Night'),
-- The One
('f017', 'Autumn', 'Date Night'), ('f017', 'Winter', 'Formal'),
-- Light Blue
('f018', 'Summer', 'Casual'), ('f018', 'Spring', 'Casual'), ('f018', 'Summer', 'Beach'),
-- Terre Hermes
('f019', 'Autumn', 'Casual'), ('f019', 'Autumn', 'Office'), ('f019', 'Spring', 'Outdoor'),
-- Spicebomb
('f029', 'Autumn', 'Casual'), ('f029', 'Winter', 'Date Night'),
-- Flowerbomb
('f030', 'Autumn', 'Date Night'), ('f030', 'Winter', 'Evening'),
-- La Vie est Belle
('f031', 'Autumn', 'Formal'), ('f031', 'Winter', 'Evening'),
-- Coco Mademoiselle
('f033', 'Spring', 'Office'), ('f033', 'Autumn', 'Date Night'), ('f033', 'Summer', 'Casual'),
-- Black Opium
('f036', 'Autumn', 'Evening'), ('f036', 'Winter', 'Date Night'),
-- Alien
('f040', 'Winter', 'Formal'), ('f040', 'Autumn', 'Evening'),
-- Angel
('f041', 'Autumn', 'Evening'), ('f041', 'Winter', 'Date Night'),
-- Good Girl
('f045', 'Autumn', 'Date Night'), ('f045', 'Winter', 'Evening'), ('f045', 'Spring', 'Casual'),
-- Libre
('f047', 'Autumn', 'Casual'), ('f047', 'Summer', 'Date Night'),
-- Oud Wood
('f049', 'Autumn', 'Formal'), ('f049', 'Winter', 'Date Night'), ('f049', 'Winter', 'Evening'),
-- Tobacco Vanille
('f051', 'Winter', 'Formal'), ('f051', 'Autumn', 'Date Night'),
-- Baccarat Rouge 540
('f054', 'Autumn', 'Formal'), ('f054', 'Winter', 'Evening'), ('f054', 'Spring', 'Date Night'),
-- Santal 33
('f058', 'Autumn', 'Casual'), ('f058', 'Winter', 'Casual'), ('f058', 'Autumn', 'Office'),
-- Layton
('f074', 'Autumn', 'Formal'), ('f074', 'Winter', 'Date Night'), ('f074', 'Spring', 'Office'),
-- Delina
('f077', 'Spring', 'Date Night'), ('f077', 'Summer', 'Casual'), ('f077', 'Spring', 'Formal'),
-- Cedrat Boise
('f073', 'Spring', 'Casual'), ('f073', 'Summer', 'Office'), ('f073', 'Autumn', 'Office');

-- ============================================
-- FRAGRANCE NOTES (selected popular ones)
-- ============================================
INSERT INTO fragrance_notes (fragrance_id, note_name, note_type) VALUES
-- Sauvage EDT
('f001', 'Bergamot', 'top'), ('f001', 'Pepper', 'top'), ('f001', 'Ambroxan', 'base'), ('f001', 'Cedar', 'base'), ('f001', 'Lavender', 'middle'),
-- Aventus
('f007', 'Pineapple', 'top'), ('f007', 'Bergamot', 'top'), ('f007', 'Birch', 'middle'), ('f007', 'Musk', 'base'), ('f007', 'Oakmoss', 'base'),
-- Tobacco Vanille
('f051', 'Tobacco', 'middle'), ('f051', 'Vanilla', 'base'), ('f051', 'Tonka Bean', 'base'), ('f051', 'Spices', 'top'), ('f051', 'Dried Fruits', 'top'),
-- Oud Wood
('f049', 'Oud', 'middle'), ('f049', 'Rosewood', 'top'), ('f049', 'Sandalwood', 'base'), ('f049', 'Vetiver', 'base'), ('f049', 'Cardamom', 'top'),
-- Santal 33
('f058', 'Sandalwood', 'base'), ('f058', 'Cedar', 'middle'), ('f058', 'Cardamom', 'top'), ('f058', 'Iris', 'middle'), ('f058', 'Leather', 'base'),
-- Baccarat Rouge 540
('f054', 'Saffron', 'top'), ('f054', 'Jasmine', 'middle'), ('f054', 'Amberwood', 'base'), ('f054', 'Fir Resin', 'base'), ('f054', 'Cedar', 'middle'),
-- Layton
('f074', 'Apple', 'top'), ('f074', 'Bergamot', 'top'), ('f074', 'Vanilla', 'base'), ('f074', 'Sandalwood', 'base'), ('f074', 'Lavender', 'middle'),
-- Black Opium
('f036', 'Coffee', 'top'), ('f036', 'White Flowers', 'middle'), ('f036', 'Vanilla', 'base'), ('f036', 'Patchouli', 'base'),
-- Coco Mademoiselle
('f033', 'Orange', 'top'), ('f033', 'Rose', 'middle'), ('f033', 'Jasmine', 'middle'), ('f033', 'Vetiver', 'base'), ('f033', 'Patchouli', 'base'),
-- Acqua di Gio
('f005', 'Bergamot', 'top'), ('f005', 'Neroli', 'top'), ('f005', 'Jasmine', 'middle'), ('f005', 'Cedar', 'base'), ('f005', 'White Musk', 'base'),
-- Terre Hermes
('f019', 'Orange Peel', 'top'), ('f019', 'Vetiver', 'base'), ('f019', 'Pepper', 'middle'), ('f019', 'Flint', 'middle'), ('f019', 'Cedar', 'base');
