export type CuratedPlaceContent = {
  journeyDescription: string;
  whyVisit: string;
  timeRequired: string;
  localExperience: string;
  seasonalNote: string;
};

export const curatedPlaceContentBySlug: Record<string, CuratedPlaceContent> = {
  paris: {
    journeyDescription:
      "Spend 3-4 days in Paris. Begin with the Louvre and the Seine, explore Le Marais and Ile de la Cite, then spend an evening around Montmartre. Keep time for Musee d'Orsay and a slow cafe afternoon rather than trying to race every monument.",
    whyVisit:
      "Paris is worth including for world-class museums, Seine-side walks, historic neighborhoods, fashion, cafes, and monuments that sit close enough to connect on foot or by metro.",
    timeRequired: "3-4 days",
    localExperience:
      "Use Le Marais, Saint-Germain, Montmartre, and canal-side cafes to break up the headline museums. A bakery breakfast, market street, or late aperitif often gives the city more texture than another rushed landmark.",
    seasonalNote:
      "Summer and early autumn can bring crowds and warm afternoons, so book major museums ahead and use mornings or evenings for outdoor walks along the Seine.",
  },
  provence: {
    journeyDescription:
      "Spend 3-4 days exploring Provence. Use Avignon or Aix-en-Provence as a base, visit local markets, drive through Luberon villages, and add Roman sites or wine towns. In lavender season, plan time around Valensole or nearby fields.",
    whyVisit:
      "Provence adds village life, Roman heritage, markets, lavender landscapes, wine routes, and countryside pacing that feels different from France's big-city stops.",
    timeRequired: "3-4 days",
    localExperience:
      "Start market mornings in towns such as Aix-en-Provence or Saint-Remy, then use afternoons for hill villages, olive oil, local wine, and slower dinners built around Provençal produce.",
    seasonalNote:
      "Lavender is seasonal, usually strongest from late June into July depending on area and weather; August brings heat, high demand, and lively village evenings.",
  },
  "french-riviera": {
    journeyDescription:
      "Spend 2-4 days on the French Riviera. Base in Nice, visit the old town and Promenade des Anglais, then add Eze, Antibes, Menton, or Saint-Paul-de-Vence for hill-town views, art, markets, and coastal walks.",
    whyVisit:
      "The Riviera brings Mediterranean light, beaches, art museums, old towns, hill villages, and easy rail links between compact coastal stops.",
    timeRequired: "2-4 days",
    localExperience:
      "Shop a morning market in Nice, take a short coastal train hop, and balance beach time with a small museum or hill-village lunch so the coast feels local rather than only resort-like.",
    seasonalNote:
      "Summer is busy and expensive along the coast; early starts, train reservations, and shaded old-town breaks make the route more comfortable.",
  },
  rome: {
    journeyDescription:
      "Spend 3-4 days in Rome. Start with the Colosseum and Roman Forum, then explore the Pantheon, Piazza Navona, and nearby churches. Set aside an afternoon for Vatican City and an evening wandering Trastevere before dinner at a neighborhood trattoria.",
    whyVisit:
      "Rome is worth visiting for ancient sites, Baroque piazzas, fountains, churches, Vatican art, and layers of history that appear throughout everyday streets.",
    timeRequired: "3-4 days",
    localExperience:
      "Walk from Campo de' Fiori toward the Pantheon, cross the Tiber into Trastevere for the evening, and look for a traditional trattoria instead of limiting the visit to archaeological sites.",
    seasonalNote:
      "Hot months make early Colosseum or Vatican entries valuable; save piazzas, gelato walks, and Trastevere for later in the day.",
  },
  florence: {
    journeyDescription:
      "Spend 2-3 days in Florence. See Michelangelo's David at the Accademia, explore the Uffizi and Duomo complex, then cross the Ponte Vecchio into Oltrarno. Finish one evening at Piazzale Michelangelo for the city view.",
    whyVisit:
      "Florence is the center of the Italian Renaissance, with the Duomo, Uffizi, Accademia, Ponte Vecchio, and compact historic streets all close enough for a walking-focused stay.",
    timeRequired: "2-3 days",
    localExperience:
      "Cross the Arno into Oltrarno for artisan workshops and quieter streets, climb to Piazzale Michelangelo near sunset, and try a lampredotto stand or traditional Tuscan trattoria.",
    seasonalNote:
      "Museum reservations matter in busy months, and summer heat makes early gallery entries and late viewpoints more comfortable.",
  },
  "amalfi-coast": {
    journeyDescription:
      "Spend 2-4 days on the Amalfi Coast. Choose a base such as Amalfi, Positano, or Ravello, then use ferries, cliffside walks, lemon groves, and sea-view villages instead of trying to drive every stop in one day.",
    whyVisit:
      "The Amalfi Coast is worth including for dramatic cliffs, pastel villages, boat rides, lemon culture, coastal food, and views that contrast with Italy's inland art cities.",
    timeRequired: "2-4 days",
    localExperience:
      "Use ferries where possible, linger in Ravello's gardens, try lemon-based desserts or seafood, and build in quiet mornings before day-trip crowds arrive.",
    seasonalNote:
      "Summer brings peak crowds and traffic; ferries, early starts, and fewer daily stops make the coast feel less stressful.",
  },
  tokyo: {
    journeyDescription:
      "Spend 4-5 days in Tokyo. Pair Asakusa or Ueno with museums, use Shibuya and Shinjuku for evening energy, visit a garden or shrine, and explore food halls, small bars, and side-street neighborhoods between train hops.",
    whyVisit:
      "Tokyo offers unmatched neighborhood variety: temples, design stores, museums, station food halls, nightlife, gardens, and everyday rituals connected by precise transit.",
    timeRequired: "4-5 days",
    localExperience:
      "Plan by neighborhood rather than by scattered attractions. Leave time for depachika food halls, a quiet shrine, an izakaya street, and the small routines around trains and convenience stores.",
    seasonalNote:
      "Late summer can be hot and humid, so use indoor museums, cafes, and station complexes during the hardest midday hours.",
  },
  kyoto: {
    journeyDescription:
      "Spend 3-4 days in Kyoto. Start early at Fushimi Inari, Kiyomizu-dera, or Arashiyama, then slow down with temple gardens, tea shops, Nishiki Market, and an evening walk through Gion or along the Kamo River.",
    whyVisit:
      "Kyoto is worth visiting for temples, gardens, tea culture, craft traditions, old streets, seasonal food, and mountain-edge neighborhoods.",
    timeRequired: "3-4 days",
    localExperience:
      "Use early mornings for famous temples, then shift to smaller gardens, matcha stops, craft lanes, and riverside evenings when day-trip crowds thin.",
    seasonalNote:
      "Summer humidity and crowds make early starts especially important; shaded temple gardens and indoor tea breaks help the pace.",
  },
  hokkaido: {
    journeyDescription:
      "Spend 4-6 days in Hokkaido. Use Sapporo for food and markets, then add Furano or Biei fields, seafood towns, hot springs, national parks, and road-trip distances that need real time.",
    whyVisit:
      "Hokkaido gives Japan a northern landscape chapter, with cooler air, wide roads, flower fields, seafood, dairy, lakes, and national parks.",
    timeRequired: "4-6 days",
    localExperience:
      "Build days around seafood markets, ramen or soup curry, countryside drives, onsen stops, and open landscapes rather than treating Hokkaido like a quick city hop.",
    seasonalNote:
      "August is strong for flower fields and outdoor routes, but popular rural transport and rental cars should be reserved early.",
  },
  "buenos-aires": {
    journeyDescription:
      "Spend 3-4 days in Buenos Aires. Explore Palermo cafes, Recoleta architecture, San Telmo market streets, bookstores, steakhouses, and a tango evening instead of treating the capital as a quick arrival stop.",
    whyVisit:
      "Buenos Aires brings tango, grand avenues, cafe culture, markets, street art, parks, late dinners, and distinct neighborhoods.",
    timeRequired: "3-4 days",
    localExperience:
      "Move between Palermo, San Telmo, Recoleta, and a classic cafe, then save energy for a late dinner or tango venue when the city comes alive.",
    seasonalNote:
      "August is cooler and good for museums, cafes, food, and walking-heavy city days without peak summer heat.",
  },
  mendoza: {
    journeyDescription:
      "Spend 2-3 days in Mendoza. Plan a bodega lunch in Maipu or the Uco Valley, walk the city plazas, and add an Andes foothills drive or cycling route between wineries.",
    whyVisit:
      "Mendoza is Argentina's wine-and-Andes stop, with vineyard meals, mountain views, plazas, and slower food-focused days.",
    timeRequired: "2-3 days",
    localExperience:
      "Choose one wine area per day, leave time for a long lunch, and use Mendoza city in the evening for plazas, restaurants, and local wine bars.",
    seasonalNote:
      "Late winter is crisp and usually drier than many regions, making wine routes and mountain views appealing with warm layers.",
  },
  "iguazu-falls": {
    journeyDescription:
      "Spend 2 days at Iguazu Falls. Walk the upper and lower circuits, include Devil's Throat when access allows, and leave space for rainforest boardwalks, misty viewpoints, and wildlife sightings.",
    whyVisit:
      "Iguazu is one of South America's great waterfall landscapes, combining powerful cascades, rainforest, boardwalks, and close-up viewpoints.",
    timeRequired: "2 days",
    localExperience:
      "Arrive early for the main circuits, carry rain protection for the spray, and slow down at quieter platforms where the forest and river are easier to notice.",
    seasonalNote:
      "Water levels and trail access can vary, so current park conditions matter more than a fixed checklist.",
  },
  banff: {
    journeyDescription:
      "Spend 3-5 days in Banff. Plan Lake Louise or Moraine Lake access early, add Bow Valley viewpoints, Johnston Canyon or easier hikes, and leave time for wildlife-aware scenic drives.",
    whyVisit:
      "Banff is a Rocky Mountain base for turquoise lakes, hiking, wildlife viewing, alpine scenery, and national-park road trips.",
    timeRequired: "3-5 days",
    localExperience:
      "Sort shuttle or parking plans before breakfast, keep hikes realistic, and use quieter viewpoints or village evenings once the famous lake areas fill.",
    seasonalNote:
      "Peak-season access is managed and competitive, so shuttles, passes, and weather checks should be handled before the day begins.",
  },
  toronto: {
    journeyDescription:
      "Spend 2-3 days in Toronto. Pair the Royal Ontario Museum or AGO with Kensington Market, Chinatown, the waterfront, and a food-neighborhood evening before any Niagara day trip.",
    whyVisit:
      "Toronto adds multicultural food, museums, lakefront walks, sports, music, and easy regional day trips to a Canada itinerary.",
    timeRequired: "2-3 days",
    localExperience:
      "Use streetcar neighborhoods, market halls, and lakefront time to feel the city beyond the skyline, then choose one focused museum or gallery day.",
    seasonalNote:
      "Warmer months are good for waterfront paths and festivals, though popular patios and Niagara side trips can be busy.",
  },
  "bergen-fjords": {
    journeyDescription:
      "Spend 3-4 days around Bergen and the fjords. Explore Bryggen, the fish market, Floyen viewpoints, rain-ready museums, and a fjord boat or rail day planned around weather and timetables.",
    whyVisit:
      "Bergen is a practical fjord gateway with a historic harbor, mountain viewpoints, seafood, museums, and access to western Norway scenery.",
    timeRequired: "3-4 days",
    localExperience:
      "Keep a rain-ready museum or seafood-hall stop near your fjord plan, then use clear breaks for Floyen, harbor walks, and boat routes.",
    seasonalNote:
      "August supports fjord travel and long days, but coastal rain can shift plans quickly, so flexible timing helps.",
  },
  oslo: {
    journeyDescription:
      "Spend 2-3 days in Oslo. Walk the Opera House waterfront, visit the Munch Museum or Bygdoy museums, try a harbor sauna, and use ferries for island time.",
    whyVisit:
      "Oslo combines design, museums, saunas, green space, coffee culture, and a calm waterfront rhythm.",
    timeRequired: "2-3 days",
    localExperience:
      "Treat the harbor as part of the city: combine a museum, sauna, food hall, and island ferry rather than only walking the central streets.",
    seasonalNote:
      "Long summer days make ferries, parks, and waterfront evenings especially easy to enjoy.",
  },
  hanoi: {
    journeyDescription:
      "Spend 2-3 days in Hanoi. Explore the Old Quarter, Hoan Kiem Lake, temple and museum stops, egg coffee, bun cha, and a street-food route that fits the traffic rhythm.",
    whyVisit:
      "Hanoi is a layered capital of old-quarter lanes, lakes, temples, cafes, markets, museums, and everyday northern Vietnamese food.",
    timeRequired: "2-3 days",
    localExperience:
      "Start early around Hoan Kiem, use cafes as pauses, try bun cha or pho in a focused food area, and cross streets steadily with the local traffic flow.",
    seasonalNote:
      "August can be hot and rainy, so keep food walks flexible and pair outdoor lanes with cafe or museum breaks.",
  },
  "hoi-an-da-nang": {
    journeyDescription:
      "Spend 3-4 days between Hoi An and Da Nang. Use Hoi An for old-town lanes, lantern evenings, tailoring and markets, then add Da Nang beaches and regional dishes such as cao lau or mi quang.",
    whyVisit:
      "This central Vietnam stop combines heritage streets, beaches, markets, lanterns, tailoring, and distinctive regional food.",
    timeRequired: "3-4 days",
    localExperience:
      "Save Hoi An old town for late afternoon into evening, use mornings for markets or beach time, and keep one meal focused on central Vietnamese specialties.",
    seasonalNote:
      "Heat and rain can shape the day, so early markets and evening old-town walks usually feel better than midday wandering.",
  },
  bariloche: {
    journeyDescription:
      "Spend 3-5 days in Bariloche. Drive or cycle Circuito Chico, walk by Nahuel Huapi, visit chocolate shops in town, and add a viewpoint hike or chairlift when the mountain weather is clear.",
    whyVisit:
      "Bariloche adds Argentina's lake-district scenery, alpine-style streets, chocolate shops, hiking access, and road-trip viewpoints.",
    timeRequired: "3-5 days",
    localExperience:
      "Use the town for chocolate and lakefront evenings, then spend clear days on viewpoints, short trails, and scenic drives around Nahuel Huapi.",
    seasonalNote:
      "Late winter can be cold and scenic, with mountain conditions affecting hikes and roads.",
  },
  "el-calafate": {
    journeyDescription:
      "Spend 3-4 days in El Calafate. Build the route around Perito Moreno Glacier boardwalks, a boat trip if conditions suit, lakefront evenings, and an estancia-style meal.",
    whyVisit:
      "El Calafate is the practical gateway to Perito Moreno Glacier and southern Patagonia's big-sky landscapes.",
    timeRequired: "3-4 days",
    localExperience:
      "Give the glacier a full day, then use the town for Patagonian food, lake views, and slower recovery before long transfers.",
    seasonalNote:
      "Winter and shoulder periods require warm layers and current road or tour checks.",
  },
  vancouver: {
    journeyDescription:
      "Spend 3-4 days in Vancouver. Walk or cycle Stanley Park, eat around Granville Island or Richmond, visit waterfront neighborhoods, and add a North Shore mountain or ferry day.",
    whyVisit:
      "Vancouver blends ocean, mountains, parks, food neighborhoods, ferries, and easy access to British Columbia nature.",
    timeRequired: "3-4 days",
    localExperience:
      "Combine seawall time with neighborhood food, a public-market stop, and one nature day so the city feels coastal rather than only urban.",
    seasonalNote:
      "Summer and early autumn are strong for parks, ferries, and mountain views, but popular outdoor routes get busy.",
  },
  bali: {
    journeyDescription:
      "Spend 4-7 days in Bali. Combine Ubud rice terraces and temples with beach time, craft villages, a food or wellness stop, and at least one quieter morning away from traffic-heavy routes.",
    whyVisit:
      "Bali offers temples, rice terraces, beaches, wellness, food, craft villages, and strong visitor infrastructure.",
    timeRequired: "4-7 days",
    localExperience:
      "Balance temple etiquette, a rice-field walk, a local warung meal, and one craft or village stop instead of only moving between beach clubs.",
    seasonalNote:
      "Popular areas face traffic and high demand, so cluster nearby stops and leave transfer buffers.",
  },
  yogyakarta: {
    journeyDescription:
      "Spend 2-3 days in Yogyakarta. Visit Borobudur and Prambanan, explore the kraton area, walk Malioboro, try gudeg, and leave time for batik or craft workshops.",
    whyVisit:
      "Yogyakarta is Java's cultural gateway for temples, royal heritage, batik, street food, art, and student-city energy.",
    timeRequired: "2-3 days",
    localExperience:
      "Use one early temple day, then return to the city for Malioboro, batik, local snacks, and palace-area streets.",
    seasonalNote:
      "Early starts help with heat, crowds, and temple light, especially during busier travel periods.",
  },
  "labuan-bajo": {
    journeyDescription:
      "Spend 3-4 days in Labuan Bajo. Use it as the base for Komodo National Park, island viewpoints, snorkeling or diving, boat days, and sunset harbor meals.",
    whyVisit:
      "Labuan Bajo is the gateway to Komodo islands, marine life, diving, boat routes, and dramatic dry-island landscapes.",
    timeRequired: "3-4 days",
    localExperience:
      "Choose a responsible boat operator, keep a buffer before flights, and use harbor evenings for seafood and sunset views.",
    seasonalNote:
      "Sea conditions and park rules should shape boat plans; confirm current guidance before departure.",
  },
  nairobi: {
    journeyDescription:
      "Spend 1-2 days in Nairobi. Visit the National Museum, local restaurants or markets, conservation sites, and Nairobi National Park if timing allows before safari transfers.",
    whyVisit:
      "Nairobi is a practical arrival base with museums, food, markets, conservation visits, and rare national-park access near a capital city.",
    timeRequired: "1-2 days",
    localExperience:
      "Use Nairobi to adjust, eat well, and add one focused cultural or conservation stop before longer road or air transfers.",
    seasonalNote:
      "Traffic and safari departure times matter, so keep the first day realistic.",
  },
  "maasai-mara": {
    journeyDescription:
      "Spend 3-4 days in the Maasai Mara. Plan dawn and late-afternoon game drives, give guides time to track wildlife, and include cultural visits only through responsible operators.",
    whyVisit:
      "The Maasai Mara is one of East Africa's major safari landscapes, known for big cats, open grasslands, photography, and seasonal migration context.",
    timeRequired: "3-4 days",
    localExperience:
      "Let wildlife movement guide the day rather than chasing a fixed list, and respect ranger or guide instructions around animals and communities.",
    seasonalNote:
      "Wildlife viewing changes by season, rain, and migration patterns, so current guide knowledge is essential.",
  },
  diani: {
    journeyDescription:
      "Spend 2-4 days at Diani Beach. Use the coast for reef activities, seafood, beach walks, boat trips, and a slower Indian Ocean pause after safari or city travel.",
    whyVisit:
      "Diani adds white sand, warm water, coral reef activities, coastal food, and rest to a Kenya itinerary.",
    timeRequired: "2-4 days",
    localExperience:
      "Plan one active water day, one unhurried beach day, and seafood meals that slow the rhythm after inland travel.",
    seasonalNote:
      "Seaweed, tides, and rain patterns can affect beach and reef plans, so check local conditions.",
  },
  "mexico-city": {
    journeyDescription:
      "Spend 3-4 days in Mexico City. Explore the historic center, Chapultepec museums, Roma and Condesa food streets, Coyoacan, and a Teotihuacan or market day if time allows.",
    whyVisit:
      "Mexico City offers museums, food, architecture, markets, parks, archaeological context, and distinct neighborhoods at high altitude.",
    timeRequired: "3-4 days",
    localExperience:
      "Pace the first day for altitude, then build around one museum area, one food neighborhood, and one market or plaza each day.",
    seasonalNote:
      "Rainy-season afternoons can shift plans, so outdoor sights often work better earlier.",
  },
  oaxaca: {
    journeyDescription:
      "Spend 2-4 days in Oaxaca. Visit Santo Domingo, markets, mezcal or mole-focused food stops, nearby craft villages, and Monte Alban above the valley.",
    whyVisit:
      "Oaxaca is known for food, markets, mezcal, textiles, Indigenous culture, colorful streets, and nearby archaeological sites.",
    timeRequired: "2-4 days",
    localExperience:
      "Use market mornings, a mole or tlayuda meal, a craft-village visit, and a Monte Alban half day to connect food with living traditions.",
    seasonalNote:
      "Festival periods and rainy afternoons affect timing, so reserve key meals or workshops early.",
  },
  yucatan: {
    journeyDescription:
      "Spend 4-6 days in the Yucatan. Base in Merida or Valladolid, visit Chichen Itza or Uxmal, swim in cenotes, walk colonial streets, and try cochinita pibil.",
    whyVisit:
      "The Yucatan combines Maya ruins, cenotes, colonial towns, regional food, beaches, and warm tropical routes.",
    timeRequired: "4-6 days",
    localExperience:
      "Pair ruins with cenote time and regional meals so the route is not only a long sequence of day trips.",
    seasonalNote:
      "Heat and storms make early archaeological visits and flexible cenote or town time useful.",
  },
  marrakech: {
    journeyDescription:
      "Spend 2-3 days in Marrakech. Move through Jemaa el-Fnaa, souks, Bahia Palace, gardens, hammams, and a riad-based evening meal inside or near the medina.",
    whyVisit:
      "Marrakech brings souks, gardens, palaces, riads, food stalls, hammams, and intense old-city atmosphere.",
    timeRequired: "2-3 days",
    localExperience:
      "Use landmarks to navigate, agree prices clearly, and leave space for tea, courtyards, and slower medina wandering.",
    seasonalNote:
      "Hot periods reward early sightseeing, shaded gardens, and evenings around food stalls or rooftops.",
  },
  fes: {
    journeyDescription:
      "Spend 2-3 days in Fes. Explore the old medina, madrasas, craft workshops, tanneries, food stalls, and historic lanes, ideally with a guide for deeper context.",
    whyVisit:
      "Fes is one of Morocco's great historic medina cities, with crafts, religious heritage, madrasas, food, and dense pedestrian streets.",
    timeRequired: "2-3 days",
    localExperience:
      "Let a guide help decode the medina, then return independently for a craft purchase, simple meal, or quieter lane once you understand the layout.",
    seasonalNote:
      "Midday heat can be draining inside the medina, so pace visits around morning and late afternoon.",
  },
  merzouga: {
    journeyDescription:
      "Spend 1-2 nights in Merzouga. Plan Erg Chebbi dunes, sunset or sunrise viewpoints, a desert camp, tea or music around camp, and enough transfer time.",
    whyVisit:
      "Merzouga is a Sahara gateway for dunes, desert camps, camel routes, stars, music, and Berber cultural context.",
    timeRequired: "1-2 nights",
    localExperience:
      "Treat the desert stay as an overnight rhythm, not a quick photo stop; sunrise, sunset, and camp time are the point.",
    seasonalNote:
      "Heat, wind, and long road transfers shape comfort, so check conditions and avoid overpacked travel days.",
  },
  queenstown: {
    journeyDescription:
      "Spend 3-4 days in Queenstown. Walk Lake Wakatipu, take a viewpoint or gondola, choose one adventure activity, visit nearby wineries, and consider Glenorchy or Fiordland day plans.",
    whyVisit:
      "Queenstown is an alpine base for lake views, adventure sports, wine, mountain drives, and access to South Island scenery.",
    timeRequired: "3-4 days",
    localExperience:
      "Balance one high-adrenaline activity with slower lakefront time, a winery meal, and a weather-aware scenic drive.",
    seasonalNote:
      "Mountain weather changes quickly, so keep outdoor bookings flexible where possible.",
  },
  rotorua: {
    journeyDescription:
      "Spend 2-3 days in Rotorua. Visit geothermal areas, redwood forest trails, lakes, and a respectful Maori cultural experience booked with care.",
    whyVisit:
      "Rotorua combines geothermal landscapes, Maori culture, forest trails, lakes, and wellness in a compact area.",
    timeRequired: "2-3 days",
    localExperience:
      "Pair one geothermal site with forest or lake time, then leave an evening for cultural context rather than squeezing everything into a drive-through stop.",
    seasonalNote:
      "Rain can affect trail comfort but geothermal and cultural sites remain useful anchor plans.",
  },
  auckland: {
    journeyDescription:
      "Spend 2-3 days in Auckland. Explore waterfront neighborhoods, Mount Eden or another volcanic cone, island ferries, food markets, and museums before longer nature routes.",
    whyVisit:
      "Auckland is a harbor city with islands, volcanic cones, food, museums, and an easy international arrival point.",
    timeRequired: "2-3 days",
    localExperience:
      "Use ferries and viewpoints to understand the city geography, then add a food neighborhood or museum rather than staying only downtown.",
    seasonalNote:
      "Weather can shift quickly, so keep ferry and viewpoint plans flexible.",
  },
  tromso: {
    journeyDescription:
      "Spend 2-4 days in Tromso. Ride the cable car, visit the Arctic Cathedral area, try harbor restaurants, explore museums, and add island drives or seasonal light excursions.",
    whyVisit:
      "Tromso offers Arctic city culture, seafood, museums, cable-car views, island scenery, and northern-route access.",
    timeRequired: "2-4 days",
    localExperience:
      "Use Tromso as more than an excursion base: walk the harbor, eat local seafood, and keep weather windows open for viewpoints.",
    seasonalNote:
      "Light, weather, and road conditions vary sharply by season, so daily flexibility is important.",
  },
  lofoten: {
    journeyDescription:
      "Spend 4-6 days in Lofoten. Slow down around Reine, Henningsvaer, beaches, short hikes, fishing villages, kayaking, and weather buffers along the island roads.",
    whyVisit:
      "Lofoten is a dramatic island route of fishing villages, mountain-backed beaches, hikes, viewpoints, and coastal food.",
    timeRequired: "4-6 days",
    localExperience:
      "Drive less each day than the map suggests, leaving time for changing light, village stops, and sudden weather shifts.",
    seasonalNote:
      "Summer daylight is generous, but wind and rain can still reshape hikes and boat plans.",
  },
  trondheim: {
    journeyDescription:
      "Spend 1-2 days in Trondheim. Visit Nidaros Cathedral, Bakklandet timber streets, river walks, cafes, cycling routes, and local food stops.",
    whyVisit:
      "Trondheim adds cathedral history, university energy, timber neighborhoods, river walks, cycling culture, and a relaxed city pace.",
    timeRequired: "1-2 days",
    localExperience:
      "Use Bakklandet and the river as the slow core of the visit, then add the cathedral and a food or cafe stop.",
    seasonalNote:
      "Longer summer days make walking and cycling easier, while rain gear remains useful.",
  },
  lima: {
    journeyDescription:
      "Spend 2-3 days in Lima. Walk Miraflores cliffs, spend an evening in Barranco, visit the historic center or museums, and plan seafood or a serious food-focused meal.",
    whyVisit:
      "Lima is Peru's coastal capital and food hub, with Pacific views, museums, historic plazas, neighborhoods, and standout seafood.",
    timeRequired: "2-3 days",
    localExperience:
      "Use Lima for ceviche, Barranco evenings, museum context, and a gentler arrival before altitude-heavy Andean routes.",
    seasonalNote:
      "Coastal weather can be gray in winter, but food, museums, and neighborhoods remain strong.",
  },
  cusco: {
    journeyDescription:
      "Spend 3-4 days in Cusco. Acclimatize first, then explore San Blas, the main plaza, markets, nearby ruins, and Sacred Valley connections before Machu Picchu or treks.",
    whyVisit:
      "Cusco is the Andean base for Inca heritage, colonial streets, markets, nearby ruins, and Sacred Valley routes.",
    timeRequired: "3-4 days",
    localExperience:
      "Keep the first day gentle for altitude, then use markets, San Blas streets, and nearby archaeological sites to build context before bigger excursions.",
    seasonalNote:
      "Altitude affects pacing in every season, so acclimatization days are not optional filler.",
  },
  arequipa: {
    journeyDescription:
      "Spend 2-3 days in Arequipa. Visit Santa Catalina Monastery, walk white-stone streets, try picanteria food, look for volcano views, and add Colca Canyon only with enough time.",
    whyVisit:
      "Arequipa brings volcanic scenery, white-stone architecture, regional food, monasteries, and access toward Colca Canyon.",
    timeRequired: "2-3 days",
    localExperience:
      "Pair monastery time with a picanteria lunch and a viewpoint for the volcanoes rather than using the city only as a canyon transfer.",
    seasonalNote:
      "Sunny days can be strong at altitude; early starts and sun protection matter.",
  },
  lisbon: {
    journeyDescription:
      "Spend 3-4 days in Lisbon. Walk Alfama, Chiado, and Bairro Alto, ride or photograph classic trams, visit Belem or Sintra, and use viewpoints for sunset.",
    whyVisit:
      "Lisbon is worth visiting for hills, azulejo tiles, viewpoints, trams, seafood, nightlife, and easy day trips.",
    timeRequired: "3-4 days",
    localExperience:
      "Break up steep walks with miradouros, pastries, seafood, and tiled streets, then save an evening for fado or neighborhood bars.",
    seasonalNote:
      "Warm months make early hill walks and late viewpoints more pleasant than midday climbs.",
  },
  porto: {
    journeyDescription:
      "Spend 2-3 days in Porto. Walk Ribeira, cross the Dom Luis I Bridge, visit tiled churches and Bolhao Market, and add port cellars in Vila Nova de Gaia.",
    whyVisit:
      "Porto adds Douro river views, port wine, tiled churches, bridges, markets, and northern Portuguese food.",
    timeRequired: "2-3 days",
    localExperience:
      "Use one day for the river and cellars, another for markets, churches, and neighborhoods above the waterfront.",
    seasonalNote:
      "Rain can make the stone streets slippery, so footwear matters even when the itinerary is urban.",
  },
  algarve: {
    journeyDescription:
      "Spend 3-5 days in the Algarve. Choose a coastal base, then plan cliff walks, beaches, seafood towns, boat caves where appropriate, and slower sunset drives between coves.",
    whyVisit:
      "The Algarve brings cliffs, coves, beaches, seafood towns, boat trips, and relaxed southern Portugal coastal days.",
    timeRequired: "3-5 days",
    localExperience:
      "Pick fewer beaches and spend longer at each, adding a seafood lunch, cliff path, or boat trip only when sea conditions suit.",
    seasonalNote:
      "Summer is peak season, so parking, boat trips, and accommodation work best with early planning.",
  },
  "cape-town": {
    journeyDescription:
      "Spend 4-5 days in Cape Town. Plan Table Mountain around weather, visit Bo-Kaap and museums, use the V&A Waterfront, add beaches, and reserve a peninsula or Cape Point day.",
    whyVisit:
      "Cape Town combines Table Mountain, beaches, food markets, museums, design, and dramatic coastal drives.",
    timeRequired: "4-5 days",
    localExperience:
      "Let weather decide the Table Mountain window, then use clear spells for viewpoints and windier moments for museums, markets, or neighborhood food.",
    seasonalNote:
      "Cape weather can be changeable in late winter, so flexible ordering matters more than a fixed day-by-day plan.",
  },
  "kruger-national-park": {
    journeyDescription:
      "Spend 3-4 days in Kruger National Park. Prioritize dawn and late-afternoon drives, keep midday slow at camp or lodge, and follow ranger guidance around wildlife.",
    whyVisit:
      "Kruger is a major safari region for wildlife drives, birding, bush lodges, guided walks, and photography.",
    timeRequired: "3-4 days",
    localExperience:
      "Use the rhythm of early starts, quiet midday breaks, and late drives rather than expecting wildlife to appear on a schedule.",
    seasonalNote:
      "Drier months can improve visibility, but sightings always depend on weather, habitat, and guide knowledge.",
  },
  "garden-route": {
    journeyDescription:
      "Spend 4-6 days on the Garden Route. Link Knysna, Wilderness, Tsitsikamma-style nature stops, beaches, forests, lagoons, and small towns without rushing every viewpoint.",
    whyVisit:
      "The Garden Route is a coastal road-trip corridor of forests, beaches, lagoons, small towns, marine wildlife, and scenic driving.",
    timeRequired: "4-6 days",
    localExperience:
      "Keep daily drives short enough for walks, markets, viewpoints, and weather changes, because the route is strongest at a slower pace.",
    seasonalNote:
      "Coastal weather can change quickly, so mix outdoor stops with town or food breaks.",
  },
  "stellenbosch-winelands": {
    journeyDescription:
      "Spend 1-2 days in the Stellenbosch Winelands. Choose one or two estates, plan a long lunch, walk Cape Dutch streets, and arrange safe transport between tastings.",
    whyVisit:
      "Stellenbosch adds vineyard estates, Cape Dutch heritage, restaurants, markets, mountain views, and slow food-focused days.",
    timeRequired: "1-2 days",
    localExperience:
      "Do less and linger longer: one estate lunch, one town walk, and one viewpoint can be better than racing through tastings.",
    seasonalNote:
      "Booking ahead helps on weekends and popular dining days, especially around wine estates.",
  },
  johannesburg: {
    journeyDescription:
      "Spend 1-2 days in Johannesburg. Visit the Apartheid Museum or Constitution Hill, add galleries or design districts, and use guided context for deeper city history.",
    whyVisit:
      "Johannesburg adds contemporary history, art, design districts, restaurants, markets, and a different urban lens on South Africa.",
    timeRequired: "1-2 days",
    localExperience:
      "Use a guided or carefully planned route for history and neighborhoods, then add a food, gallery, or market stop.",
    seasonalNote:
      "Highveld weather can be crisp in winter and spring; plan layers and daytime-focused movement.",
  },
  bangkok: {
    journeyDescription:
      "Spend 3-4 days in Bangkok. Visit Wat Pho or the Grand Palace, ride river ferries, explore Chinatown, use markets and mall food courts, and save street food for the evening.",
    whyVisit:
      "Bangkok offers temples, river life, markets, malls, street food, nightlife, and a high-energy urban start to Thailand.",
    timeRequired: "3-4 days",
    localExperience:
      "Balance temple etiquette with river transport, food courts, and night food streets so the city feels navigable rather than overwhelming.",
    seasonalNote:
      "Heat and rain make shaded breaks, river timing, and evening food plans useful.",
  },
  "chiang-mai": {
    journeyDescription:
      "Spend 3-4 days in Chiang Mai. Visit old-city temples, Doi Suthep, night markets, cafes, and a cooking class or mountain day with a responsible operator.",
    whyVisit:
      "Chiang Mai adds northern Thai temples, markets, mountains, craft culture, cafes, and a slower city pace.",
    timeRequired: "3-4 days",
    localExperience:
      "Use mornings for temples or Doi Suthep, afternoons for cafes or cooking, and evenings for night markets and northern dishes.",
    seasonalNote:
      "Weather and air quality vary by season, so current local conditions should shape outdoor plans.",
  },
  krabi: {
    journeyDescription:
      "Spend 3-5 days in Krabi. Use Ao Nang or Railay for limestone cliffs, island boats, kayaking, beach time, and relaxed seafood meals.",
    whyVisit:
      "Krabi is a southern Thailand coast base for cliffs, beaches, island trips, kayaking, climbing, and warm-water scenery.",
    timeRequired: "3-5 days",
    localExperience:
      "Check sea conditions, choose one boat route at a time, and keep beach days slow enough to enjoy the limestone setting.",
    seasonalNote:
      "Rain, tides, and sea conditions can change boat plans, so build flexibility into island days.",
  },
  istanbul: {
    journeyDescription:
      "Spend 3-4 days in Istanbul. Explore Sultanahmet, the Grand Bazaar, mosque courtyards, Bosphorus ferries, Beyoglu or Kadikoy food streets, and coffeehouse stops.",
    whyVisit:
      "Istanbul layers Byzantine and Ottoman heritage, bazaars, mosques, ferries, food streets, and European-Asian neighborhood contrasts.",
    timeRequired: "3-4 days",
    localExperience:
      "Use ferries as part of the day, not just transport, and balance major monuments with tea, markets, and neighborhood food.",
    seasonalNote:
      "Hot months reward early monument visits and later Bosphorus or food-street evenings.",
  },
  cappadocia: {
    journeyDescription:
      "Spend 2-3 days in Cappadocia. Visit Goreme Open-Air Museum, walk valleys, stay in or visit cave-town areas, and use sunrise viewpoints beyond balloon photos.",
    whyVisit:
      "Cappadocia is a volcanic landscape of valleys, cave hotels, open-air museums, viewpoints, local wine, and sunrise balloon scenery.",
    timeRequired: "2-3 days",
    localExperience:
      "Plan one valley walk, one museum or underground-city stop, and one sunrise viewpoint so the region is not only a balloon image.",
    seasonalNote:
      "Balloon flights and hikes depend on weather, so keep more than one morning available if that experience matters.",
  },
  "antalya-lycian-coast": {
    journeyDescription:
      "Spend 3-5 days around Antalya and the Lycian Coast. Pair the old town with beaches, boat days, ancient ruins such as Phaselis, mountain views, and relaxed seafood dinners.",
    whyVisit:
      "This coast combines Mediterranean beaches, old-town lanes, ruins, boat trips, mountain views, and summer dining.",
    timeRequired: "3-5 days",
    localExperience:
      "Alternate beach or boat days with ruins and old-town evenings, avoiding long midday sightseeing in the strongest heat.",
    seasonalNote:
      "August is hot and busy, so early ruins and later dinners are more comfortable.",
  },
  "izmir-ephesus": {
    journeyDescription:
      "Spend 2-3 days around Izmir and Ephesus. Use Izmir for waterfront food and bazaars, then plan Ephesus, Sirince or nearby villages, and Aegean meals.",
    whyVisit:
      "Izmir and Ephesus pair a modern Aegean city with one of the Mediterranean's major ancient archaeological sites.",
    timeRequired: "2-3 days",
    localExperience:
      "Give Ephesus a focused half day, then return to Izmir or nearby villages for food, markets, and waterfront evenings.",
    seasonalNote:
      "Exposed ruins can be very hot in summer, so early entry and water matter.",
  },
  pamukkale: {
    journeyDescription:
      "Spend 1 day in Pamukkale. Walk the travertine terraces, explore Hierapolis, learn the thermal-water history, and time the white slopes for sunrise or late-day light.",
    whyVisit:
      "Pamukkale combines white travertines, ancient Hierapolis, thermal water, viewpoints, and a distinctive landscape stop.",
    timeRequired: "1 day",
    localExperience:
      "Keep the visit focused and unhurried, protecting bare feet on the terraces and avoiding the hottest exposed hours where possible.",
    seasonalNote:
      "Summer heat and glare are strong, so early or late timing improves comfort and photos.",
  },
  "ho-chi-minh-city": {
    journeyDescription:
      "Spend 2-3 days in Ho Chi Minh City. Visit markets and museums, walk District 1, try coffee shops and food streets, then use rooftop views or evening neighborhoods for the city's pace.",
    whyVisit:
      "Ho Chi Minh City brings energetic food streets, markets, museums, coffee culture, nightlife, and contemporary southern Vietnam.",
    timeRequired: "2-3 days",
    localExperience:
      "Use cafe breaks between museums and markets, then save food streets and rooftop views for evening when the heat softens.",
    seasonalNote:
      "Rainy-season showers can be sudden, so keep indoor stops near outdoor plans.",
  },
  "ninh-binh": {
    journeyDescription:
      "Spend 1-2 days in Ninh Binh. Plan a Trang An or Tam Coc boat route, Hang Mua viewpoints, pagodas, rice fields, and cycling between countryside stops.",
    whyVisit:
      "Ninh Binh offers limestone karst scenery, river boats, pagodas, rice fields, viewpoints, and slower countryside days.",
    timeRequired: "1-2 days",
    localExperience:
      "Choose one boat route, one viewpoint, and one cycling or pagoda stop rather than rushing all the karst sights.",
    seasonalNote:
      "Rain and heat affect boat comfort and viewpoints, so start early and keep a flexible order.",
  },
  "ha-long-bay": {
    journeyDescription:
      "Spend 1-2 nights on Ha Long Bay. Use the time for limestone islands, caves, kayaking, seafood meals, and quieter water-level views from a boat route.",
    whyVisit:
      "Ha Long Bay is a seascape of limestone islands, boat journeys, caves, kayaking, seafood, and bay views.",
    timeRequired: "1-2 nights",
    localExperience:
      "An overnight boat gives the bay more breathing room than a rushed day trip; choose operators carefully and check route details.",
    seasonalNote:
      "Storms or poor visibility can affect sailings, so weather flexibility is important.",
  },
  barcelona: {
    journeyDescription:
      "Spend 3-5 days in Barcelona. Visit the Sagrada Familia and other Gaudi sites, walk the Gothic Quarter, browse La Boqueria or neighborhood markets, and leave time for the beach or Montjuic views.",
    whyVisit:
      "Barcelona combines modernist architecture, Mediterranean city life, markets, museums, beaches, and Catalan identity.",
    timeRequired: "3-5 days",
    localExperience:
      "Balance major Gaudi tickets with a market breakfast, a neighborhood tapas evening, and slower time around Gracia, El Born, or the waterfront.",
    seasonalNote:
      "August is hot and crowded, so book major sights ahead and use mornings or evenings for longer walks.",
  },
  seville: {
    journeyDescription:
      "Spend 2-4 days in Seville. Visit the Alcazar, Cathedral, Giralda, Santa Cruz lanes, tapas bars, and a flamenco evening, with shaded breaks during the hottest hours.",
    whyVisit:
      "Seville brings Andalusian architecture, flamenco, tapas, orange-tree plazas, and a strong evening street rhythm.",
    timeRequired: "2-4 days",
    localExperience:
      "Use early mornings for the Alcazar or Cathedral, then save tapas streets and flamenco for the evening when the city feels alive.",
    seasonalNote:
      "Summer heat is intense, so midday rest is part of practical planning rather than wasted time.",
  },
  mallorca: {
    journeyDescription:
      "Spend 4-7 days in Mallorca. Combine Palma, mountain villages, coves, coastal drives, cycling or boat days, and seafood meals rather than staying on one beach.",
    whyVisit:
      "Mallorca offers Mediterranean beaches, Serra de Tramuntana villages, Palma culture, cycling, coves, and island food.",
    timeRequired: "4-7 days",
    localExperience:
      "Choose a base carefully, then alternate cove days with village drives, Palma markets, and slower dinners built around local seafood or island produce.",
    seasonalNote:
      "August is peak island season, so accommodation, cars, and popular coves need early starts or advance planning.",
  },
  "antigua-guatemala": {
    journeyDescription:
      "Spend 2-4 days in Antigua Guatemala. Walk the colonial streets, visit church ruins and courtyards, try coffee or market food, and use volcano views as part of the daily rhythm.",
    whyVisit:
      "Antigua is a walkable colonial base with cobblestone streets, ruins, cafes, markets, volcano views, and strong access to nearby experiences.",
    timeRequired: "2-4 days",
    localExperience:
      "Start early around the arch and markets, pause in courtyards or cafes, and use evenings for local food rather than rushing between photo spots.",
    seasonalNote:
      "Rainy-season showers can shape afternoons, so mornings are valuable for walking and views.",
  },
  "lake-atitlan": {
    journeyDescription:
      "Spend 2-4 days around Lake Atitlan. Choose a village that matches your pace, ride boats between communities, visit weaving or craft workshops, and leave time for volcano-framed viewpoints.",
    whyVisit:
      "Lake Atitlan combines volcanic scenery, boat-linked villages, Maya culture, crafts, cafes, and slower lake travel.",
    timeRequired: "2-4 days",
    localExperience:
      "Pick the village first, then use boats for focused day visits rather than trying to sample every lakeside community quickly.",
    seasonalNote:
      "Rain and lake conditions can affect boat timing, so keep transfers flexible.",
  },
  tikal: {
    journeyDescription:
      "Spend a full day or overnight near Flores for Tikal. Walk the main plazas and temples with a guide, listen for forest wildlife, and consider sunrise or early entry if logistics work.",
    whyVisit:
      "Tikal is a major Maya archaeological site set inside rainforest, where temples, plazas, wildlife, and history overlap.",
    timeRequired: "Full day or overnight near Flores",
    localExperience:
      "Use a guide for context, bring water and insect protection, and give the forest setting as much attention as the stone temples.",
    seasonalNote:
      "Heat, humidity, and rain make early starts and sturdy footwear important.",
  },
  landmannalaugar: {
    journeyDescription:
      "Spend a full day or overnight around Landmannalaugar. Plan rhyolite mountain trails, geothermal scenery, hot-spring time where permitted, and highland transport suited to F-roads.",
    whyVisit:
      "Landmannalaugar is one of Iceland's key Highland landscapes, known for colorful rhyolite mountains, lava fields, geothermal ground, and summer hiking.",
    timeRequired: "Full day or overnight trek base",
    localExperience:
      "Treat access as part of the plan: check road conditions, use appropriate transport, and stay on marked trails to protect fragile terrain.",
    seasonalNote:
      "Highland access is seasonal and weather-dependent, so summer plans still need road checks.",
  },
  thorsmork: {
    journeyDescription:
      "Spend a full day or more in Thorsmork. Use proper highland transport, hike glacial valley trails, and leave enough time for river-crossing logistics and sudden weather changes.",
    whyVisit:
      "Thorsmork is a dramatic Icelandic valley framed by glaciers, ridges, hiking routes, and remote highland scenery.",
    timeRequired: "Full day with specialized transport or multi-day trek",
    localExperience:
      "Book a highland bus or guide rather than casual rental-car access, then let the trail conditions and weather set the day's ambition.",
    seasonalNote:
      "River crossings and highland weather can change quickly, so access decisions should be conservative.",
  },
  "south-coast": {
    journeyDescription:
      "Spend one long day to several days on Iceland's South Coast. Visit waterfalls, black-sand beaches, glacier viewpoints, and coastal villages while leaving time for wind, waves, and photo stops.",
    whyVisit:
      "The South Coast delivers Iceland's classic sequence of waterfalls, glaciers, volcanic beaches, cliffs, and road-accessible drama.",
    timeRequired: "One long day to several days",
    localExperience:
      "Choose fewer stops than the map suggests, stay back from sneaker waves, and use official pullouts rather than stopping on roads.",
    seasonalNote:
      "Long summer days help with pacing, but wind, rain, and coastal warnings can still reshape the route.",
  },
};

export function getCuratedPlaceContent(placeSlug: string | undefined) {
  return placeSlug ? curatedPlaceContentBySlug[placeSlug] : undefined;
}
