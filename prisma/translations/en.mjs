// Traductions anglaises du contenu de départ (chargées par prisma/seed-translations.mjs).
const keep = `<h2>Storage tips</h2><p>Store at room temperature, away from light and moisture. Do not refrigerate.</p>`;
const h2 = (t) => `<h2 style="font-family:var(--font-serif);font-size:clamp(26px,3vw,34px);color:#2B2118;margin:48px 0 16px;font-weight:400;">${t}</h2>`;
const p = (t) => `<p style="font-size:16.5px;color:#4a4036;line-height:1.8;margin:0 auto;max-width:640px;">${t}</p>`;

export default {
  // libellés des variantes (communs à tous les produits)
  variantTitles: { '250 g': '250 g', '500 g': '500 g', '1 KG': '1 kg', Noir: 'Black', Beige: 'Beige' },

  products: {
    'coffret-gourmand-4-pots-de-500-g': {
      title: 'Gourmet gift box – 4 jars of 500 g',
      description: `<p>A gourmet gift box for tasting or sharing, with 4 jars of 500 g each.</p><ul><li>Contents: Orange blossom honey | Daghmous | Mountain herbs | Eucalyptus</li><li>Quantity per jar: 500 g</li><li>Total net weight: 2 kg</li></ul>`,
    },
    'miel-de-caroubier': {
      title: 'Carob Honey',
      optionName: 'Weight',
      description: `<p>Rare and precious, carob honey is one of the most sought-after treasures of Moroccan terroir. Its deep amber colour and smooth texture reveal woody, gently sweet aromas with an enveloping softness.</p><p>Harvested in Morocco’s protected forests, this exceptional honey is selected for its purity and unique character. Every jar is an invitation to discover the richness of Moroccan flora.</p><h2>Origin</h2><p>Idaou Tanan</p><h2>Flavour</h2><p>Woody, mild, lightly caramelised</p><h2>Texture</h2><p>Smooth, dense, melting</p><h2>Tasting tips</h2><p>Enjoy it straight from the spoon, on a slice of artisan bread or alongside a board of aged cheeses.</p>${keep}`,
    },
    'miel-deucalyptus': {
      title: 'Eucalyptus Honey',
      optionName: 'Weight',
      description: `<p>Fresh and aromatic, ASAL eucalyptus honey is harvested in Morocco’s vast eucalyptus forests. Its light golden colour and fluid texture reveal minty, slightly balsamic notes of incomparable freshness.</p><p>Traditionally used to soothe the throat, this exceptional honey is as perfect for tasting moments as it is for everyday life.</p><h2>Origin</h2><p>Oualidia (summer harvest) &amp; Agadir</p><h2>Flavour</h2><p>Fresh, minty, slightly balsamic</p><h2>Texture</h2><p>Fluid, light, slow crystallisation</p><h2>Tasting tips</h2><p>Ideal in a hot herbal tea, on plain yoghurt or with a fresh cheese.</p>${keep}`,
    },
    'miel-de-thym': {
      title: 'Thyme Honey',
      optionName: 'Weight',
      badge: 'Limited harvest',
      description: `<p>Intense and captivating, ASAL thyme honey is one of the noblest in Moroccan gastronomy. Its warm amber colour and generous texture unveil herbaceous and floral aromas of remarkable depth.</p><p>Harvested in the wild scrublands of Morocco where thyme grows freely, this rare honey reflects a preserved terroir and ancestral beekeeping know-how.</p><h2>Origin</h2><p>Rachidia &amp; Idaoutanan</p><h2>Flavour</h2><p>Herbaceous, floral, slightly spicy</p><h2>Texture</h2><p>Generous, smooth, fine crystallisation</p><h2>Tasting tips</h2><p>Sublime on roast meat, in a homemade vinaigrette or simply by the spoonful to appreciate all its complexity.</p>${keep}`,
    },
    'miel-doranger': {
      title: 'Orange Blossom Honey',
      optionName: 'Weight',
      description: `<p>Luminously sweet and incomparably delicate, ASAL orange blossom honey is harvested in the heart of Morocco’s flowering orange groves. Its pale golden colour and silky texture reveal subtle floral notes and the captivating scent of orange blossom.</p><p>One of the most loved honeys for its finesse, it charms from the very first spoonful with its elegant sweetness and delicate aroma.</p><h2>Origin</h2><p>Oulad Taima, Souss region</p><h2>Flavour</h2><p>Floral, mild, delicate, slightly fruity</p><h2>Texture</h2><p>Silky, fluid, melting</p><h2>Tasting tips</h2><p>Perfect on crêpes, in mint tea or with a light dessert. Ideal for sweetening with elegance.</p>${keep}`,
    },
    'miel-des-herbes-des-montagnes': {
      title: 'Mountain Herbs Honey',
      optionName: 'Weight',
      description: `<p>Complex and wild, ASAL mountain herbs honey is a symphony of flavours born from the floral diversity of the Moroccan highlands. Its deep amber colour and rich texture reveal a unique aromatic bouquet, a subtle blend of wild plants and high-altitude flowers.</p><p>Harvested in Morocco’s unspoilt mountains, this rare honey carries the purity of the summit air and the richness of an exceptional flora. A living, authentic honey that tells the story of an extraordinary mountain terroir.</p><h2>Origin</h2><p>High Atlas mountains</p><h2>Flavour</h2><p>Complex, aromatic, floral and herbaceous, woody high-altitude notes</p><h2>Texture</h2><p>Rich, smooth, natural crystallisation</p><h2>Tasting tips</h2><p>Enjoy it on its own to appreciate all its complexity, or with aged cheeses and artisan bread.</p>${keep}`,
    },
    'miel-de-jujubier': {
      title: 'Jujube (Sidr) Honey',
      optionName: 'Weight',
      badge: 'Limited harvest',
      description: `<p>Considered one of the most precious honeys in the world, ASAL Sidr honey is harvested in the wild valleys of Morocco where the wild jujube tree grows. Its dark amber, almost mahogany colour and thick, velvety texture make it an exceptional honey, prized by the greatest connoisseurs.</p><p>Its powerful, enveloping aroma, with caramel and woody notes, leaves a lasting impression. A rare honey of incomparable nobility, worthy of the finest tables.</p><h2>Origin</h2><p>Souss region</p><h2>Flavour</h2><p>Powerful, caramelised, woody, long finish</p><h2>Texture</h2><p>Thick, velvety, dense, very slow crystallisation</p><h2>Tasting tips</h2><p>Savour it on its own, by the spoonful, to fully appreciate its complexity. Also sublime with a blue cheese or alongside a strong black tea.</p>${keep}`,
    },
    'miel-multifleurs': {
      title: 'Wildflower Honey',
      optionName: 'Weight',
      description: `<p>A living expression of Moroccan biodiversity, ASAL wildflower honey is a natural blend born from dozens of wild floral species. Its amber-gold colour and smooth texture reveal an evolving aromatic profile, both mild and complex.</p><p>A generous, accessible honey that captures the essence of a preserved Moroccan terroir and the richness of its seasons.</p><h2>Origin</h2><p>Meadows of the Souss and Al Haouz regions</p><h2>Flavour</h2><p>Mild, floral, evolving, slightly fruity</p><h2>Texture</h2><p>Smooth, fluid, gradual crystallisation</p><h2>Tasting tips</h2><p>Perfect every day — on toast, in yoghurt, or to naturally sweeten your hot drinks.</p>${keep}`,
    },
    'miel-d-euphorbe': {
      title: 'Zakoum Honey',
      optionName: 'Weight',
      description: `<p>Made from Zakkoum, an emblematic plant of Morocco’s arid regions, this rare and precious ASAL honey is one of the most sought-after by connoisseurs. Its dark amber colour and dense texture reveal powerful, slightly woody aromas of remarkable singularity.</p><p>A honey with character, rooted in Moroccan tradition, that charms with its rarity and strong personality.</p><h2>Origin</h2><p>Beni Mellal</p><h2>Flavour</h2><p>Powerful, woody, slightly bitter, persistent</p><h2>Texture</h2><p>Dense, thick, slow crystallisation</p><h2>Tasting tips</h2><p>Savour it on its own to appreciate its uniqueness, or with aged cheeses and dates.</p>${keep}`,
    },
    'miel-de-daghmous': {
      title: 'Daghmous Honey',
      optionName: 'Weight',
      badge: 'Limited harvest',
      description: `<p>Made from Daghmous, a succulent plant of Morocco’s arid lands, this confidential ASAL honey is a true rarity. Its amber-gold colour and smooth texture reveal mild, slightly spicy aromas of unique originality.</p><p>A confidential honey, loved by enlightened enthusiasts for its rarity and its deep connection with Morocco’s wildest terroir.</p><h2>Origin</h2><p>Aït Baamrane</p><h2>Flavour</h2><p>Mild, slightly spicy, original</p><h2>Texture</h2><p>Smooth, dense, natural crystallisation</p><h2>Tasting tips</h2><p>Enjoy it on its own to discover its uniqueness, or with oriental pastries.</p>${keep}`,
    },
    'coffret-cosy-6-miels-dexception-pots-de-250-g': {
      title: 'Cosy Gift Box – 6 Exceptional Honeys (250 g jars)',
      optionName: 'Box colour',
      description: `<p>Treat someone — or yourself — to a moment of sweetness with the ASAL Cosy Gift Box. A selection of 6 Moroccan honeys, chosen for how well they complement each other and for their natural elegance.</p><h2>What’s inside</h2><ul><li>Thyme honey – 250 g</li><li>Orange blossom honey – 250 g</li><li>Sidr honey – 250 g</li><li>Eucalyptus honey – 250 g</li><li>Daghmous honey – 250 g</li><li>Carob honey – 250 g</li></ul><p>Ideal for celebrations, special occasions or simply to treat yourself.</p><h2>Giving ASAL as a gift?</h2><p>You can now add your own words for your loved ones and express your gratitude ✍️</p>`,
    },
    'miel-danis': {
      title: 'Anise Honey',
      optionName: 'Size',
      description: `<p>Rare and delicate, ASAL anise honey is harvested from anise flowers in the Idaoutanane region. It stands out for its golden colour, its sweetness and its aromatic notes naturally reminiscent of anise.</p><h2>Origin</h2><p>Idaoutanane</p><h2>Flavour</h2><p>Mild, aromatic, with aniseed and slightly spicy notes</p><h2>Texture</h2><p>Smooth and soft, may crystallise naturally over time</p><h2>Tasting tips</h2><p>Enjoy it by the spoonful, on bread, in yoghurt or to naturally sweeten a herbal tea. It can also be used in pastries and other recipes.</p><h2>Storage tips</h2><p>Store at room temperature, away from light, heat and moisture. Crystallisation is a natural process that does not affect the quality of the honey.</p>`,
    },
    'coffret-decouverte-9-miels-dexception-pots-de-100-g': {
      title: 'Discovery Gift Box – 9 Exceptional Honeys (100 g jars)',
      optionName: 'Box colour',
      description: `<h2>Why this gift box?</h2><p>Not sure which honeys best suit your daily life, your habits or simply your cravings?</p><p>Choose the <strong><em>Discovery gift box</em></strong> and explore 9 of the most loved honeys in Morocco.</p><p><em><strong>Taste, compare and find your favourite honeys for your next purchase.</strong></em></p><h2>What’s inside</h2><ul><li>Thyme honey – 100 g</li><li>Orange blossom honey – 100 g</li><li>Sidr honey – 100 g</li><li>Eucalyptus honey – 100 g</li><li>Daghmous honey – 100 g</li><li>Carob honey – 100 g</li><li>Wildflower honey – 100 g</li><li>Mountain herbs honey – 100 g</li><li>Zakkoum honey – 100 g</li></ul>`,
    },
  },

  categories: {
    'coffrets-cadeaux': { title: 'Gift Boxes' },
    decouverte: { title: 'Discovery', description: 'Your first steps into the world of ASAL: the discovery box and our mildest must-haves.' },
    'gorge-respiration': { title: 'Throat & Breathing', description: 'Gentle on the throat: honeys with mild, balsamic notes, to enjoy by the spoonful or in a hot drink.' },
    immunite: { title: 'Immunity', description: 'Our honeys traditionally enjoyed to get through the changing seasons.' },
    'les-rares': { title: 'The Gems', description: 'Treasures of the hive: Manuka 840 MGO, Daghmous, Thyme and Jujube. Exceptional honeys, harvested in limited quantities.' },
    'nos-miels': { title: 'Our Honeys' },
    'energie-vitalite': { title: 'Energy & Vitality', description: 'To start the day right: generous honeys, by the spoonful, on toast or in a hot drink.' },
  },

  sections: {
    hero_video: {
      eyebrow: 'THE ART OF GIVING',
      heading: 'Exceptional honeys,<br>straight from Morocco.',
      text: 'Euphorbia, Daghmous, Thyme, Orange blossom. Rare, 100% natural harvests, carefully selected and delivered to your door.',
      btn1Label: 'Discover our honeys',
      btn2Label: 'See the gift boxes',
      mobileHeading: 'Exceptional gift boxes, straight from Morocco.',
      mobileText: 'Six or nine rare honeys in a black and gold case.',
      mobileBtnLabel: 'See the gift boxes',
      mobileLinkLabel: 'Our honeys',
    },
    reassurance: {
      items: [
        { title: 'Build your gift box your way', text: 'In 250 g or 500 g jars' },
        { title: 'Free delivery from 300 MAD', text: 'Everywhere in Morocco · Shipped from Marrakech' },
        { title: '100% natural honey', text: 'Harvested in Morocco' },
        { title: 'Reply within 24 hours', text: 'A question? Write to us' },
      ],
    },
    product_band: { eyebrow: 'LIMITED EDITION', title: 'The Gems', text: 'Our rarest honeys, reserved for connoisseurs.', badge: 'Limited harvest' },
    product_row: { title: 'Our Honeys', text: 'Hive classics, from mild to bold.', linkLabel: 'See all →' },
    needs: {
      heading: 'By need',
      text: 'The right honey for every moment of the day.',
      cards: [
        { title: 'Immunity', text: 'Strengthen your natural defences.', linkLabel: 'Discover →' },
        { title: 'Throat & Breathing', text: 'Gentle on the throat.', linkLabel: 'Discover →' },
        { title: 'Energy & Vitality', text: 'A natural boost.', linkLabel: 'Discover →' },
        { title: 'Discovery', text: 'Explore our Moroccan terroirs.', linkLabel: 'Discover →' },
      ],
    },
    gift_split: {
      eyebrow: 'THE ART OF GIVING',
      heading: 'Two cases.<br><em>One thoughtful gesture.</em>',
      text: 'A selection of Moroccan honeys presented in an elegant case, with a card for your own words.',
      pills: [{ label: 'Ready to give' }, { label: 'Message card' }, { label: 'Elegant presentation' }],
      imageAlt: 'ASAL message card sealed with wax',
      seal: 'Your<br>message',
    },
    coffrets: {
      eyebrow: 'To give',
      heading: 'Gift Boxes',
      text: 'Our most loved honeys, gathered in ready-to-give gift boxes.',
      cards: [
        { badge: 'The most generous', title: 'Cosy Gift Box, 6 Exceptional Honeys', tagline: 'Ideal for celebrations and big occasions.', features: ['6 exceptional honeys, 250 g jars', 'Thyme, Orange blossom, Sidr, Eucalyptus, Daghmous, Carob', 'Free personalised message card'], ctaLabel: 'Choose this gift box' },
        { badge: '9 honeys to explore', title: 'Discovery Gift Box, 9 Exceptional Honeys', tagline: 'To explore and find your favourite honeys.', features: ['9 exceptional honeys, 100 g jars', 'Daghmous, Sidr, Thyme, Orange blossom, Zakkoum and more', 'Free personalised message card'], ctaLabel: 'Choose this gift box' },
      ],
    },
    blog_latest: { heading: 'Honey, a way of life', text: 'Our tips, recipes and discoveries about honey' },
    compose_cta: {
      eyebrow: 'Made to measure',
      heading: 'Build your gift box',
      text: 'A unique gift, just like you.',
      note: 'Boxes are made with 250 g jars only or 500 g jars only.',
      steps: [
        { title: 'Choose your honeys', text: 'From our 10 exceptional honey varieties.' },
        { title: 'Add your message', text: 'Personalised, in your own words, slipped into the box.' },
        { title: 'We prepare your gift box', text: 'With care, ready to give.' },
      ],
      ctaLabel: 'Create my gift box',
    },
    story: {
      eyebrow: 'OUR STORY',
      heading: 'From the Moroccan apiary to your table',
      text: 'ASAL selects rare honeys from Morocco, produced by artisanal and responsible beekeeping. Every harvest is carefully preserved to keep all the natural richness of the honey.',
      imageAlt: 'ASAL honey from Moroccan terroir',
      linkLabel: 'Discover our story →',
    },
    faq: {
      heading: 'Frequently asked questions',
      text: 'Everything you need to know before ordering.',
      items: [
        { q: 'How should I store ASAL honey?', a: 'Keep your honey in a cool, dry place, away from direct light. Honey may crystallise over time, which is perfectly normal. You can gently warm it in a bain-marie to bring back its liquid texture.' },
        { q: 'What are the delivery times?', a: 'Orders are processed within 2–3 working days. Delivery usually takes 5–7 working days depending on your location.' },
        { q: 'Is cash on delivery available?', a: 'Yes, we offer cash on delivery for your convenience. You pay the courier directly when you receive your order.' },
        { q: 'How do I choose my gift box?', a: 'Each gift box is designed to offer a unique experience. Read the detailed description of each box to see which honeys are included and choose the one that suits your tastes.' },
        { q: 'Can I build my own gift box?', a: 'Yes, you can customise the gift box of your choice as you wish. Simply send us your request by private message (composition, types of honey, sizes, quantity, etc.) and we will give you the corresponding price.' },
        { q: 'Do you offer options for companies?', a: 'Absolutely. We offer customised gift boxes for companies: client gifts, seminars, corporate events. Bespoke packaging, engraving and personalised messages are available. Contact us for a quote tailored to your needs.' },
        { q: 'Do you collaborate with other brands?', a: 'Yes, we are open to collaborations with premium brands that share our values of authenticity and excellence. Whether for co-branded boxes, events or B2B partnerships, contact us at contact@asalmaroc.com to discuss your project.' },
        { q: 'Where do your honeys come from?', a: 'Our honeys are harvested in Morocco’s most unspoilt regions: the Atlas mountains, the Souss valleys, the Gharb plains and the arid lands of the South. Each variety reflects the unique terroir of its region, offering exceptional aromatic profiles.' },
        { q: 'Are your honeys certified?', a: 'Yes, our honeys are certified 100% natural and pure. Every batch is laboratory-tested to guarantee the absence of pesticides, antibiotics and additives. We work exclusively with certified beekeepers who follow traditional and sustainable beekeeping practices.' },
      ],
      cardTitle: 'Another question?',
      cardText: 'Our team will be happy to answer within 24 working hours.',
      cardBtnLabel: 'Contact us',
    },
  },

  pages: {
    'notre-histoire': {
      title: 'Our Story',
      content: [
        h2('The story of Asal'),
        p('Asal was born from a deep passion for Moroccan honey and a desire to share its treasures with the world. In the Atlas mountains and the flowering plains of Morocco, our bees forage wild flowers to produce honey of incomparable richness and purity.'),
        h2('Our commitment'),
        p('Every jar of Asal is the fruit of artisanal know-how handed down from generation to generation. We work closely with local beekeepers who share our vision: preserving traditions, respecting nature and offering an exceptional product.'),
        h2('Exceptional quality'),
        p('Our honeys are harvested by hand, with no additives or preservatives, to guarantee a 100% natural product. From Jujube honey to mountain varieties, every flavour tells a unique story of Moroccan terroir.'),
        h2('Our vision'),
        p('At Asal, we believe honey is much more than a food — it is a way of life. That is why we take care of every detail, from the hive to your table, to offer you an extraordinary taste and sensory experience.'),
      ].join('\n'),
    },
    faq: { title: 'FAQ', faq: true }, // reprend les questions de la section FAQ de l'accueil
    'livraison-retours': {
      title: 'Delivery & Returns',
      content: `<h3>Delivery in mainland France</h3><p><strong>Times:</strong> shipped within 24 to 48 working hours, delivered in 2 to 4 working days via Colissimo or Mondial Relay (pick-up point or home).</p><p><strong>Shipping costs:</strong> 32 MAD — <strong>free from 328 MAD</strong>.</p><p>A confirmation e-mail with tracking is sent to you as soon as your order ships.</p><h3>Returns</h3><p>In accordance with European law, you have 14 days after receipt to change your mind. For hygiene reasons, only unopened products in their original packaging can be returned. Please contact us before any return to receive the procedure.</p>`,
    },
    contact: { title: 'Contact' },
    'composez-votre-coffret': { title: 'Build your gift box' },
    'privacy-policy': { title: 'Privacy Policy' },
    'legal-notice': {
      title: 'Legal Notice',
      content: `<h2>Site publisher</h2><p>ASAL Maroc — Marrakech, Morocco.<br>E-mail: contact@asalmaroc.com</p><h2>Hosting</h2><p>Enter your hosting provider here.</p><h2>Intellectual property</h2><p>All content (texts, images, logos) on this site is the exclusive property of ASAL. Any reproduction is prohibited without prior authorisation.</p>`,
    },
    'terms-of-service': {
      title: 'Terms and Conditions of Sale',
      content: `<h2>Article 1 — Purpose</h2><p>These terms govern the sale of ASAL products on this site.</p><h2>Article 2 — Prices</h2><p>Prices are shown in Moroccan dirhams (MAD), all taxes included.</p><h2>Article 3 — Order and payment</h2><p>Payment is made on delivery, in cash, to the courier.</p><h2>Article 4 — Delivery</h2><p>Delivery everywhere in Morocco. Free delivery from 300 MAD.</p><h2>Article 5 — Returns</h2><p>See our Delivery &amp; Returns page.</p>`,
    },
  },

  posts: {
    '4-facons-de-manger-votre-miel-au-quotidien': {
      title: '4 Ways to Enjoy Your Honey Every Day',
      excerpt: 'Discover how to make honey part of your daily routine and enjoy all its benefits, from breakfast to bedtime.',
      content: `<p>Honey isn’t just for winter sore throats. Here are four simple ways to make it part of your daily life, from morning to evening.</p><h2>1. At breakfast</h2><p>On wholemeal toast, in plain yoghurt or on homemade granola: a spoonful of honey at breakfast gives you gentle energy to start the day. Orange blossom or thyme honey pairs especially well with dairy.</p><h2>2. In your drinks</h2><p>Warm tea with honey and lemon, hot milk with honey in the evening: timeless classics. Golden rule: wait until the drink is warm (below 40 degrees) before adding the honey, to preserve all its goodness.</p><h2>3. In savoury cooking</h2><p>Honey enhances sweet-and-savoury dishes: honey vinaigrette, chicken marinade, or the famous Moroccan tagine with prunes and almonds. A few drops of euphorbia honey also lift a goat’s cheese.</p><h2>4. As a snack and before exercise</h2><p>Made of natural simple sugars, honey is a quickly available source of energy. A spoonful before a workout or at the children’s snack time: simple and effective.</p><p>Like any sugar, honey should be enjoyed in moderation: one to two tablespoons a day are enough to benefit from it.</p>`,
    },
    'le-miel-de-manuka-un-tresor-de-medecine-naturelle': {
      title: 'Manuka Honey: a Treasure of Natural Medicine',
      excerpt: 'Manuka honey is known worldwide for its unique properties and exceptional therapeutic virtues.',
      content: `<h2>A honey like no other</h2><p>Manuka honey comes from New Zealand, where bees forage the flowers of manuka, a shrub of the tea-tree family (Leptospermum scoparium). What makes it famous worldwide is its exceptional concentration of methylglyoxal (MGO), a compound naturally present at far higher levels than in other honeys.</p><h2>UMF and MGO ratings explained</h2><p>To guarantee its authenticity, Manuka is graded on two scales: UMF (Unique Manuka Factor) and MGO. The higher the rating, the higher the methylglyoxal content. MGO 100+ suits everyday use, while ratings of 400+ and above are sought for more targeted uses.</p><h2>How to use it every day</h2><p>Tradition has it taken by the teaspoon, in the morning on an empty stomach or for an irritated throat. Avoid mixing it with a very hot liquid: like all raw honeys, it loses some of its qualities above 40 degrees. Choose a warm drink instead.</p><h2>And what about Moroccan honeys?</h2><p>At ASAL, we uphold the same standards: raw, unheated, cold-extracted honeys. Our thyme, euphorbia and carob honeys are also treasures of the hive, each with its own character and traditional uses. Manuka has its worldwide reputation; our Moroccan honeys have their authenticity.</p>`,
    },
    'les-bienfaits-du-miel-entre-la-science-et-les-traditions': {
      title: 'The Benefits of Honey: Between Science and Tradition',
      excerpt: 'For thousands of years, honey has been used as a natural remedy. What does modern science say about these ancient traditions?',
      content: `<h2>A 4,000-year-old remedy</h2><p>Honey appears in the papyri of ancient Egypt, where it was already used to treat wounds. Hippocrates prescribed it, and traditions around the world, from Morocco to Asia, credit it with protective virtues. But what does modern science say?</p><h2>What research confirms</h2><p>Studies carried out over recent decades have highlighted several properties: honey is rich in antioxidants (polyphenols), it soothes an irritated throat, and several clinical trials show its effectiveness against night-time coughs, comparable to some syrups. Externally, medical-grade honey is even used in hospitals to promote healing.</p><h2>Moroccan traditions</h2><p>In Morocco, honey is part of the family medicine cabinet: hot milk with honey against colds, thyme honey for the throat, or simply a spoonful of honey in the morning during winter. Simple habits handed down from generation to generation.</p><h2>The final word: quality and moderation</h2><p>All these benefits depend on raw, unheated, unprocessed honey: exactly what we harvest at ASAL. And let’s state the obvious: honey remains a natural sugar. One to two spoonfuls a day, as part of a balanced diet, is the right amount to enjoy it for the long term.</p>`,
    },
  },

  settings: {
    brand: {
      tagline: 'Morocco’s natural gold',
      footerBlurb: 'Rare honeys from Morocco, selected at the source and delivered with care everywhere in Morocco.',
      copyright: '© 2026 abeille bio Morocco',
    },
    announcement: { items: ['Free delivery from <strong>300 MAD</strong>'] },
    menus: {
      header: [
        { label: 'Our Honeys' },
        { label: 'Gift Boxes' },
        { label: 'The Gems' },
        { label: 'By need', children: [{ label: 'Immunity' }, { label: 'Throat & Breathing' }, { label: 'Energy & Vitality' }, { label: 'Discovery' }] },
        { label: 'Our Story' },
        { label: 'Blog' },
        { label: 'Contact' },
      ],
      footer1Title: 'The brand',
      footer1: [{ label: 'Our Story' }, { label: 'FAQ' }, { label: 'Contact' }],
      footer2Title: 'Information',
      footer2: [{ label: 'Legal notice' }, { label: 'Terms of sale' }, { label: 'Privacy policy' }, { label: 'Delivery & Returns' }],
      legal: [{ label: 'Legal notice' }, { label: 'Terms of sale' }, { label: 'Privacy' }],
    },
    social: { title: 'Follow us' },
    newsletter: { title: 'Stay informed', text: 'Receive our exclusive offers and be the first to hear about our new products.', placeholder: 'Email address' },
    shop: { country: 'Morocco', codTitle: 'Cash on delivery', codText: 'Pay in cash when you receive your order.', address: 'Marrakech, Morocco' },
    product: {
      trustItems: [{ label: '100% natural, raw and pure' }, { label: 'Laboratory tested' }, { label: 'Carefully shipped within 48 h' }, { label: '100% secure payment' }],
      reviewsEyebrow: 'Your opinion matters',
      reviewsTitle: 'Customer reviews',
      relatedTitle: 'You may also like',
      addToCartLabel: 'Add to cart',
      soldOutLabel: 'Sold out',
    },
    composer: {
      eyebrow: 'Made to measure',
      title: 'Build your gift box',
      text: 'Choose your size, the number of jars, then your favourite honeys.',
      ctaLabel: 'Add my gift box to cart',
    },
    seo: {
      title: 'ASAL — Exceptional honeys from Morocco',
      description: 'Rare, 100% natural honeys from Morocco: Thyme, Daghmous, Jujube (Sidr), Euphorbia… Gift boxes and delivery everywhere in Morocco.',
    },
  },
};
