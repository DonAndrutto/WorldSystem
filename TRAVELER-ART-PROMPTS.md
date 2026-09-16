# Traveler atlas generation

Asset: `assets/rebirth/travelers.png`, 1536 × 1024, RGBA, six columns and two rows. Generated and background-extracted with the built-in image-generation tool. Top row: male; bottom row: female. Columns: Bhutanese, Tibetan, Indian, Chinese, Thai, Western.

## Generation prompt

Use case: stylized-concept.
Asset type: ONE production transparent sprite atlas of 12 selectable human travelers for a Himalayan-inspired board game.
Primary request: a culturally distinct Bhutanese, Tibetan, Indian, Chinese, Thai and Western roster, with one male and one female adult character for each. Warm, dignified, varied individual faces and ages, respectful clothing, no caricatures.
Composition: landscape canvas, exactly SIX equal columns and TWO equal rows. Top row all six male figures, bottom row all six female figures. Columns in order LEFT TO RIGHT: Bhutanese, Tibetan, Indian, Chinese, Thai, Western. Each isolated FULL-BODY figure centered in its own equal cell. Same head height, same foot baseline in each row, same scale; all shoes, hair, hats and hands entirely within cell. Generous clear padding between figures. Relaxed upright front three-quarter stance, arms close to body, readable small silhouettes.
Clothing and individuality:
Column 1 Bhutanese: male in rust and ochre checked knee-length gho with broad white turned-back cuffs, dark knee socks and leather shoes; female in woven deep plum ankle-length kira and short gold silk toego jacket with white cuffs.
Column 2 Tibetan: male in dark indigo wool chuba, asymmetric wrap, red waist sash and boots; female in teal long chuba, cream long-sleeved blouse, striped pangden apron, braided hair and boots.
Column 3 Indian: male in warm cream kurta and ochre dhoti with sandals, medium brown complexion and short beard; female in terracotta sari with a gold border draped over one shoulder over a simple blouse, medium brown complexion, dark tied hair and sandals.
Column 4 Chinese: male in muted jade changshan-style long tunic and charcoal trousers with cloth shoes; female in soft blue and plum cross-collar blouse and long pleated skirt with cloth shoes, dark hair in a bun. Refined everyday traditional clothing, no fantasy armor or imperial dress.
Column 5 Thai: male in a cream collarless cotton shirt and dark teal chong kraben-style wrapped trousers with sandals; female in a deep green and gold traditional wrapped long skirt and warm ivory shoulder sash over a modest fitted blouse, hair neatly tied, sandals.
Column 6 Western: male mature light-skinned traveler with short brown hair and beard, olive hiking jacket, charcoal trousers and brown walking boots; female light-skinned traveler with short auburn hair, muted blue hiking jacket, ochre scarf, charcoal trousers and brown walking boots. Contemporary understated walking clothes, no oversized backpacks.
Style: consistent hand-painted mineral-pigment watercolor and delicate ink, warm parchment-game palette but NO parchment background. Detailed clothing and kind natural faces, not cartoon stereotypes. These are ordinary lay travelers, not gods or saints.
Background: genuine transparent alpha. No backdrop, no ground shadows, no scenery, no decorative frames, no labels, no lettering, no borders, no halos, no weapons. Exact 6 by 2 atlas alignment is essential.

## Background-extraction prompt

Use case: background-extraction. Edit the supplied 6-column by 2-row traveler sprite atlas. Remove ONLY the entire brown/grey painterly background and every surrounding glow or shadow, replacing it with genuine fully transparent alpha (not a checkerboard illustration, not white, not black). Preserve all 12 people exactly: identical faces, clothes, colors, poses, feet, pixel positions, scale, cell alignment and canvas dimensions. Keep the 1536 by 1024 landscape layout and the six male characters on top and six female characters below. No crop, no rearrangement, no new objects or text. Carefully cut out the people including all hair edges, hands and shoes; transparent pixels between and around every figure. This must be a usable transparent PNG sprite sheet.

