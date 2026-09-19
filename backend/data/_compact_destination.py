from datetime import datetime, timezone

from models import (
    DestinationCountryCreate,
    DestinationMonthlyFactorsCreate,
    DestinationPlaceCreate,
)


VERIFIED_AT = datetime(2026, 8, 14, tzinfo=timezone.utc)


def source(
    source_name: str,
    source_url: str,
    source_type: str = "official-tourism-board",
    notes: str | None = None,
    confidence: float = 0.88,
):
    return {
        "source_name": source_name,
        "source_url": source_url,
        "source_type": source_type,
        "retrieved_at": VERIFIED_AT,
        "last_verified_at": VERIFIED_AT,
        "confidence": confidence,
        "verification_status": "source-recorded",
        "notes": notes,
    }


def text_note(title: str, body: str, sources: list[dict]):
    return {"title": title, "body": body, "sources": sources}


def media(url: str, alt_text: str, source_record: dict):
    return {
        "url": url,
        "alt_text": alt_text,
        "credit": "Unsplash",
        "source": source_record,
    }


PLACE_TIME_REQUIRED = {
    "buenos-aires": "3-4 days",
    "mendoza": "2-3 days",
    "bariloche": "3-5 days",
    "iguazu-falls": "2 days",
    "el-calafate": "3-4 days",
    "toronto": "2-3 days",
    "banff": "3-5 days",
    "vancouver": "3-4 days",
    "paris": "3-4 days",
    "provence": "2-4 days",
    "french-riviera": "2-4 days",
    "bali": "4-7 days",
    "yogyakarta": "2-3 days",
    "labuan-bajo": "3-4 days",
    "rome": "3-4 days",
    "florence": "2-3 days",
    "amalfi-coast": "2-4 days",
    "tokyo": "4-5 days",
    "kyoto": "3-4 days",
    "hokkaido": "4-6 days",
    "nairobi": "1-2 days",
    "maasai-mara": "3-4 days",
    "diani": "2-4 days",
    "mexico-city": "3-4 days",
    "oaxaca": "2-4 days",
    "yucatan": "4-6 days",
    "marrakech": "2-3 days",
    "fes": "2-3 days",
    "merzouga": "1-2 nights",
    "queenstown": "3-4 days",
    "rotorua": "2-3 days",
    "auckland": "2-3 days",
    "oslo": "2-3 days",
    "bergen-fjords": "3-4 days",
    "tromso": "2-4 days",
    "lofoten": "4-6 days",
    "trondheim": "1-2 days",
    "lima": "2-3 days",
    "cusco": "3-4 days",
    "arequipa": "2-3 days",
    "lisbon": "3-4 days",
    "porto": "2-3 days",
    "algarve": "3-5 days",
    "cape-town": "4-5 days",
    "kruger-national-park": "3-4 days",
    "garden-route": "4-6 days",
    "stellenbosch-winelands": "1-2 days",
    "johannesburg": "1-2 days",
    "bangkok": "3-4 days",
    "chiang-mai": "3-4 days",
    "krabi": "3-5 days",
    "istanbul": "3-4 days",
    "cappadocia": "2-3 days",
    "antalya-lycian-coast": "3-5 days",
    "izmir-ephesus": "2-3 days",
    "pamukkale": "1 day",
    "hanoi": "2-3 days",
    "hoi-an-da-nang": "3-4 days",
    "ho-chi-minh-city": "2-3 days",
    "ninh-binh": "1-2 days",
    "ha-long-bay": "1-2 nights",
}


PLACE_LOCAL_EXPERIENCES = {
    "buenos-aires": "Spend time in Palermo cafes, San Telmo market streets, Recoleta architecture, and an evening tango venue instead of treating the city as a single downtown stop.",
    "mendoza": "Build the visit around a bodega lunch in Maipu or the Uco Valley, a relaxed plaza evening in Mendoza city, and a clear-weather drive toward the Andes foothills.",
    "bariloche": "Use Bariloche for Circuito Chico viewpoints, lakeside walks around Nahuel Huapi, chocolate shops in town, and a hike or chairlift viewpoint when the weather opens.",
    "iguazu-falls": "Plan both the upper and lower waterfall circuits, leave time for the Devil's Throat area when access allows, and move slowly enough to watch the rainforest edges and river mist.",
    "el-calafate": "Base the stay around Perito Moreno Glacier viewpoints, a boat or boardwalk day, and an estancia-style meal or lakefront evening to feel Patagonia beyond the transfer route.",
    "toronto": "Pair the Royal Ontario Museum or Art Gallery of Ontario with Kensington Market, Chinatown, the waterfront, and a food-neighborhood evening rather than only using Toronto as a Niagara gateway.",
    "banff": "Anchor days around Lake Louise or Moraine Lake access, Bow Valley viewpoints, Johnston Canyon or easier hikes, and early shuttle planning before the parking pressure builds.",
    "vancouver": "Mix Stanley Park, Granville Island, neighborhood food in Richmond or Commercial Drive, and a North Shore mountain or ferry day so the city feels coastal rather than just urban.",
    "paris": "Start with the Louvre or Musee d'Orsay, walk the Seine and Ile de la Cite, then use Montmartre, Le Marais, and cafe time to make Paris feel like neighborhoods, not only monuments.",
    "provence": "Base yourself around Avignon, Aix-en-Provence, or Luberon villages, then shape days around Provençal markets, Roman sites, countryside drives, local wine, and lavender areas in season.",
    "french-riviera": "Use Nice as a practical base, then add coastal walks, markets, art museums, beaches, and hill towns such as Eze or Saint-Paul-de-Vence for a Riviera route with more than seaside time.",
    "bali": "Balance temple visits such as Tirta Empul or Tanah Lot with rice terraces, beach time, a village craft stop, and slower evenings around Ubud or the coast.",
    "yogyakarta": "Use Yogyakarta for Borobudur and Prambanan access, but keep time for the kraton area, Malioboro street life, batik workshops, and local food such as gudeg.",
    "labuan-bajo": "Treat Labuan Bajo as a boat-trip base for Komodo National Park, island viewpoints, snorkeling or diving days, and a sunset harbor evening before or after the water route.",
    "rome": "Spend an evening in Trastevere, explore the smaller streets around Campo de' Fiori, and connect the Colosseum, Roman Forum, Pantheon, and piazzas with trattoria stops.",
    "florence": "Build days around the Uffizi, Duomo area, Ponte Vecchio, Oltrarno workshops, San Lorenzo market, and Piazzale Michelangelo at sunset rather than rushing every museum at once.",
    "amalfi-coast": "Choose a base such as Amalfi, Positano, or Ravello, then plan ferry rides, lemon-flavored food stops, cliffside walks, and one slower village day to avoid only chasing viewpoints.",
    "tokyo": "Explore Tokyo through neighborhoods: pair Asakusa or Ueno with museums, Shibuya or Shinjuku evenings, depachika food halls, and quieter shrine or garden stops between transit hops.",
    "kyoto": "Start early at Kiyomizu-dera, Fushimi Inari, or Arashiyama, then slow down in Gion lanes, tea shops, temple gardens, and riverside evenings when day-trip crowds thin.",
    "hokkaido": "Give Hokkaido enough time for Sapporo food, Furano or Biei fields, seafood markets, national parks, and road distances that feel much larger than a city-based Japan route.",
    "nairobi": "Use Nairobi for the National Museum, Karen or conservation-area visits, local restaurants, and Nairobi National Park if timing allows before heading deeper into safari country.",
    "maasai-mara": "Plan early and late game drives, give guides time to track wildlife movement, and include a respectful cultural visit only with a responsible operator.",
    "diani": "Let Diani be a coastal pause with reef activities, seafood, beach walks, and a slower Indian Ocean rhythm after inland safari or city travel.",
    "mexico-city": "Spend days across the historic center, Chapultepec museums, Roma and Condesa food streets, Coyoacan, and a planned Teotihuacan or market day if the route allows.",
    "oaxaca": "Use Oaxaca for markets, mole and mezcal, Santo Domingo, nearby craft villages, and Monte Alban, leaving evenings for the zocalo and street food.",
    "yucatan": "Shape the Yucatan around Merida or Valladolid, Chichen Itza or Uxmal, cenote swims, colonial streets, and regional food such as cochinita pibil.",
    "marrakech": "Move through Jemaa el-Fnaa, souks, Bahia Palace, gardens, and a riad-based evening meal, with enough time to navigate the medina without rushing.",
    "fes": "Explore Fes through the old medina, tanneries, madrasas, craft workshops, and food stalls, ideally with a local guide for the densest lanes.",
    "merzouga": "Use Merzouga for Erg Chebbi dunes, a desert camp night, sunset or sunrise viewpoints, and music or tea around camp rather than a quick photo stop.",
    "queenstown": "Balance Lake Wakatipu walks, a viewpoint or gondola, adventure activities, nearby wineries, and a realistic day trip toward Glenorchy or Fiordland.",
    "rotorua": "Plan geothermal areas, redwood forest walks, lakeside time, and a Maori cultural experience that is booked respectfully rather than squeezed between drives.",
    "auckland": "Use Auckland for waterfront neighborhoods, volcanic cones such as Mount Eden, island ferries, food markets, and museums before moving into longer nature routes.",
    "oslo": "Spend time around the Opera House, Munch Museum, harbor saunas, Bygdoy museums, and island ferries so Oslo feels like a waterfront city, not just an arrival point.",
    "bergen-fjords": "Use Bergen for Bryggen, the fish market, Floyen viewpoints, rain-ready museums, and a fjord boat or rail day planned around weather and timetables.",
    "tromso": "Build Tromso around the cable car, Arctic Cathedral area, harbor restaurants, museums, and island drives or light-focused excursions depending on the season.",
    "lofoten": "Slow down for Reine or Henningsvaer, beach viewpoints, short hikes, fishing-village stops, kayaking, and weather buffers along the island roads.",
    "trondheim": "Focus Trondheim on Nidaros Cathedral, Bakklandet timber streets, river walks, cafes, cycling, and local food rather than using it only as a rail stop.",
    "lima": "Use Lima for Miraflores cliffs, Barranco evenings, the historic center, museums, ceviche, and one serious food-focused meal if budget allows.",
    "cusco": "Give Cusco acclimatization time, then explore San Blas, the main plaza, markets, nearby ruins, and Sacred Valley connections before demanding hikes.",
    "arequipa": "Spend time with Santa Catalina Monastery, white-stone streets, volcano views, picanteria food, and a Colca Canyon plan only if the schedule allows.",
    "lisbon": "Build Lisbon around Alfama, Bairro Alto or Chiado, miradouros, trams, seafood, tiles, and a day trip to Belem or Sintra if the stay is long enough.",
    "porto": "Use Porto for Ribeira, tiled churches, Bolhao market, bridge views, port cellars in Vila Nova de Gaia, and a Douro river or wine-focused extension.",
    "algarve": "Choose a coastal base, then plan cliff walks, beaches, seafood towns, Benagil-style boat trips where appropriate, and slower sunset drives between coves.",
    "cape-town": "Use Cape Town for Table Mountain, Bo-Kaap, the V&A Waterfront, museums, beaches, and a peninsula or Cape Point day with weather-aware flexibility.",
    "kruger-national-park": "Prioritize dawn and late-afternoon drives, keep midday slow at camp or lodge, and follow ranger guidance around wildlife distance and road rules.",
    "garden-route": "Drive the Garden Route through Knysna, Wilderness or Tsitsikamma-style nature stops, beaches, forests, and small towns without packing every viewpoint into one day.",
    "stellenbosch-winelands": "Plan the Winelands around one or two estates, a long lunch, Cape Dutch streets, mountain views, and safe transport between tastings.",
    "johannesburg": "Use Johannesburg for the Apartheid Museum, Constitution Hill, galleries, Maboneng or Braamfontein food stops, and guided context around the city's history.",
    "bangkok": "Balance the Grand Palace or Wat Pho with river ferries, markets, mall food courts, Chinatown, and an evening street-food route when the heat drops.",
    "chiang-mai": "Use Chiang Mai for old-city temples, Doi Suthep, night markets, cooking classes, cafes, and a mountain or village day planned with responsible operators.",
    "krabi": "Plan Krabi around Railay or Ao Nang access, limestone cliffs, island boats, kayaking, beach time, and weather-aware sea conditions.",
    "istanbul": "Spend days across Sultanahmet, the Grand Bazaar, ferries on the Bosphorus, Beyoglu or Kadikoy food streets, and mosque etiquette at active sites.",
    "cappadocia": "Use Cappadocia for Goreme Open-Air Museum, valley walks, cave hotels, sunrise viewpoints, and underground-city or local wine stops beyond the balloon photos.",
    "antalya-lycian-coast": "Pair Antalya's old town with beaches, boat days, ancient ruins such as Phaselis or nearby sites, and relaxed seafood dinners along the coast.",
    "izmir-ephesus": "Use Izmir for waterfront food and bazaars, then plan Ephesus, Sirince or nearby villages, and Aegean meals without making the ruins a rushed side trip.",
    "pamukkale": "Keep Pamukkale focused on the travertine terraces, Hierapolis, sunrise or late-day light, and enough rest around the hot exposed site.",
    "hanoi": "Explore Hanoi through the Old Quarter, Hoan Kiem Lake, temple and museum stops, egg coffee, bun cha, and a street-food route that fits the traffic rhythm.",
    "hoi-an-da-nang": "Split time between Hoi An's old town, lantern evenings, tailoring or market visits, Da Nang beaches, and regional dishes such as cao lau or mi quang.",
    "ho-chi-minh-city": "Use Ho Chi Minh City for markets, museums, cafe culture, District 1 walks, rooftop views, and food streets that show the city's pace.",
    "ninh-binh": "Plan Ninh Binh around Tam Coc or Trang An boat routes, Hang Mua viewpoints, pagodas, rice fields, and cycling between countryside stops.",
    "ha-long-bay": "Treat Ha Long Bay as an overnight or long boat experience with limestone islands, caves, kayaking, seafood, and quieter water-level time where possible.",
}


def place(
    slug: str,
    country_slug: str,
    name: str,
    region: str,
    kind: str,
    description: str,
    highlights: list[str],
    tags: list[str],
    activities: list[str],
    source_record: dict,
    image_url: str,
):
    return {
        "slug": slug,
        "country_slug": country_slug,
        "name": name,
        "region": region,
        "type": kind,
        "story": description,
        "description": description,
        "media": [media(image_url, f"{name} travel landscape", source_record)],
        "why_visit": f"Visit for {', '.join(highlights[:3]).lower()} and a strong local travel rhythm.",
        "time_required": PLACE_TIME_REQUIRED.get(slug, "1-3 days"),
        "highlights": highlights,
        "tags": tags,
        "activities": activities,
        "local_experience": PLACE_LOCAL_EXPERIENCES.get(slug),
        "access_notes": [
            text_note(
                "Plan local access",
                "Check official transport, opening, and visitor guidance before finalizing the route.",
                [source_record],
            )
        ],
        "local_vibe_notes": tags[:5],
        "safety_warnings": [
            text_note(
                "Use normal visitor awareness",
                "Keep valuables secure, follow local guidance, and adjust plans around weather or crowd conditions.",
                [source_record],
            )
        ],
        "seasonal_warnings": [
            text_note(
                "August conditions",
                "August can bring heat, rain, crowds, or high demand depending on region and elevation.",
                [source_record],
            )
        ],
        "sources": [source_record],
    }


COUNTRY_SPECIFIC_GOOD_TO_KNOW = {
    "argentina": [
        ("Dinner runs late", "In Buenos Aires and many cities, dinner often starts much later than visitors expect. Restaurants can feel quiet at times that would be peak dinner elsewhere."),
        ("Mate is social, not just a drink", "Mate is commonly shared in a group with its own rhythm. If invited, follow the host's lead rather than stirring or rearranging the straw."),
        ("Distances are continental", "Argentina is huge. Patagonia, Iguazu, Mendoza, and Buenos Aires are not casual short hops; domestic flights or overnight buses can shape the whole route."),
        ("Protected areas need planning", "Popular Patagonia trails, glacier trips, and national park services can require advance reservations or current local guidance in busy periods."),
    ],
    "canada": [
        ("Park access is managed", "Popular national parks such as Banff and Jasper can require passes, shuttle reservations, or timed parking plans during peak travel periods."),
        ("Rules vary by province", "Alcohol, cannabis, driving, and some public-space rules differ by province, so advice that works in Ontario may not match British Columbia or Quebec."),
        ("Indigenous places are living places", "Many landscapes and cultural sites are connected to First Nations, Inuit, or Metis communities. Follow local protocols and posted guidance."),
        ("Wildfire smoke can change routes", "In summer, wildfire smoke or closures can affect western routes and park access. Check provincial and park alerts before locking plans."),
    ],
    "france": [
        ("Start with bonjour", "In shops, cafes, bakeries, and small hotels, greeting staff with bonjour before asking a question is a basic courtesy, not a decorative phrase."),
        ("Some businesses close in August", "August can bring local holidays and reduced hours, especially outside major tourist zones. Check restaurant and shop schedules before crossing town."),
        ("City driving may need stickers", "Several French cities use Crit'Air emissions stickers or restricted zones. Visitors renting cars should check rules before entering city centers."),
        ("Meal timing matters", "Outside major tourist areas, lunch and dinner windows can be more fixed than visitors expect, with kitchens closing between services."),
    ],
    "indonesia": [
        ("Temple dress is practical etiquette", "In Bali and many sacred sites, visitors may need a sarong, sash, covered shoulders, or modest dress. Follow posted rules and local guidance."),
        ("Indonesia is not one culture", "Bali, Java, Flores, Sumatra, and other regions have different languages, religions, foods, and visitor rhythms. Avoid treating the country as one island."),
        ("Marine areas need care", "Reefs, manta sites, and island parks often have local rules on boats, waste, and wildlife distance. Choose operators who explain those rules clearly."),
        ("Traffic time can surprise visitors", "Short distances in Bali, Jakarta, or island ports can take much longer than maps suggest. Build buffers around transfers and ferries."),
    ],
    "italy": [
        ("ZTL zones are real", "Many historic centers have restricted traffic zones called ZTLs. Driving into one without permission can lead to fines, even if a rental-car GPS sends you there."),
        ("Regional train tickets may need validation", "Some regional paper train tickets must be validated before boarding. Check the ticket type rather than assuming all tickets work like high-speed rail."),
        ("Ferragosto changes August", "Around mid-August, local holidays can affect opening hours, beaches, roads, and restaurants. Book key meals and transfers earlier than usual."),
        ("Coffee has a local rhythm", "Standing at the bar, ordering simply, and drinking quickly is normal in many cafes. Sitting at a table can cost more in some places."),
    ],
    "japan": [
        ("Quiet transit is part of etiquette", "On trains, phone calls and loud conversations are avoided. Queueing and keeping bags out of the way are small habits that matter."),
        ("Cash still solves edge cases", "Cards are common, but shrine shops, older restaurants, rural buses, lockers, or small inns may be easier with yen in smaller notes and coins."),
        ("Shoes rules change by space", "Ryokan, temples, fitting rooms, some restaurants, and private interiors may require shoes off. Watch the threshold and follow the slippers."),
        ("Trash bins can be scarce", "Public bins are not always easy to find. Carry small wrappers until you reach a station, convenience store, hotel, or proper recycling point."),
    ],
    "kenya": [
        ("Safari rules protect wildlife", "In parks and reserves, staying in vehicles, keeping distance, and following ranger or guide instructions are safety rules, not optional etiquette."),
        ("Ask before photographing people", "In markets, villages, and community areas, especially around Maasai or other cultural visits, ask before taking portraits or close photos."),
        ("Plastic bag rules are strict", "Kenya has strict restrictions on plastic bags. Travelers should avoid packing disposable plastic bags and follow current environmental rules."),
        ("Mobile money is part of daily life", "M-Pesa is widely used locally, but visitors should still keep cards and cash options because setup and acceptance can vary."),
    ],
    "mexico": [
        ("Altitude changes city days", "Mexico City and several inland destinations sit at high elevation. First-day pacing, hydration, and lighter schedules can make a real difference."),
        ("Archaeological sites have formal rules", "Major ruins and museums can restrict drones, tripods, food, climbing, or large bags. Follow INAH and site-specific rules."),
        ("Cenotes and reefs need low-impact habits", "In Yucatan and coastal areas, showers, reef-safe products, and no-touch wildlife rules help protect fragile water systems."),
        ("Small cash remains useful", "Cards are common in cities, but markets, colectivos, small food stands, toilets, and tips often work better with small peso notes and coins."),
    ],
    "morocco": [
        ("Medina navigation is different", "Old medinas can feel maze-like by design. Use landmarks, agree on guide prices clearly, and allow extra time for finding riads or gates."),
        ("Mosque access is limited", "Non-Muslim visitors cannot enter many mosques in Morocco, with some notable exceptions. Admire respectfully and check local rules before entering."),
        ("Friday affects the rhythm", "Friday prayers and family time can affect shop hours, transport feel, and restaurant timing, especially outside heavily touristed areas."),
        ("Bargaining has boundaries", "Bargaining is normal in many souks, but not everywhere. Keep it polite, know when to walk away, and avoid treating every interaction as a contest."),
    ],
    "new-zealand": [
        ("Biosecurity is strict", "Declare food, hiking boots, outdoor gear, and natural items when required. New Zealand takes biosecurity seriously to protect farms and ecosystems."),
        ("DOC huts and walks book out", "Great Walks, huts, campsites, and popular tracks can require advance booking through the Department of Conservation."),
        ("Weather changes fast outdoors", "Alpine, coastal, and volcanic areas can change quickly. Local track status and weather warnings matter even on popular routes."),
        ("Maori culture is living culture", "Te reo Maori, marae protocol, place names, and local iwi connections are part of current community life, not only heritage displays."),
    ],
    "norway": [
        ("Access rights come with duties", "Allemannsretten allows broad outdoor access, but visitors must respect private homes, cultivated land, wildlife, fire rules, and leave-no-trace expectations."),
        ("Alcohol sales are regulated", "Wine and spirits are sold through Vinmonopolet, with limited hours. Supermarkets have separate rules for beer sales."),
        ("Ferries and tunnels shape routes", "Western Norway routes can depend on ferries, tunnels, and mountain roads. Timetables and weather can matter as much as distance."),
        ("Mountain weather is serious", "Even popular hikes can face fog, wind, cold, or rapid changes. Check local trail advice and avoid treating viewpoints as casual city walks."),
    ],
    "peru": [
        ("Altitude needs respect", "Cusco, Lake Titicaca routes, and Andean treks are high enough to affect many travelers. Build acclimatization days before demanding hikes."),
        ("Machu Picchu uses timed circuits", "Machu Picchu visits are controlled by tickets, entry times, and circuit rules. Buy the correct ticket for the route you actually want."),
        ("Markets are not just souvenirs", "Textiles, foods, and craft traditions are tied to living Quechua and Aymara communities. Ask before portraits and buy respectfully."),
        ("Long-distance routes are slow", "Mountains, deserts, and jungle access make Peru bigger in practice than it looks on a simple map. Avoid tight same-day transfers."),
    ],
    "portugal": [
        ("Couvert is optional but charged", "Bread, olives, or small starters placed on the table may be charged if eaten. It is acceptable to decline them politely."),
        ("Calçada can be slippery", "Portugal's patterned stone pavements are beautiful but can be slick in rain or on steep streets. Shoes matter in Lisbon and Porto."),
        ("Electronic tolls need planning", "Some highways use electronic tolls. Rental drivers should confirm the payment device or toll process before leaving the desk."),
        ("Tiles are protected heritage", "Azulejos are part of architectural heritage. Do not remove, buy suspicious loose tiles, or treat tiled facades as props."),
    ],
    "south-africa": [
        ("Load shedding can affect plans", "Power cuts can affect restaurants, traffic lights, accommodation, and card payments. Check current schedules and keep devices charged."),
        ("Safari distance rules matter", "In reserves and national parks, remain in vehicles where required and follow ranger guidance. Wildlife proximity is not a photo challenge."),
        ("Water awareness is local etiquette", "Drought history and regional water limits mean short showers and water-conscious habits are appreciated, especially in the Western Cape."),
        ("Driving context changes quickly", "City driving, rural roads, and park roads require different awareness. Avoid leaving valuables visible in cars and plan fuel stops."),
    ],
    "thailand": [
        ("Temple etiquette is visible", "Cover shoulders and knees at many temples, remove shoes where required, and avoid climbing or posing disrespectfully near Buddha images."),
        ("The head and feet carry meaning", "Avoid touching people's heads or pointing feet at people, monks, or sacred objects. Small body-language habits can feel important."),
        ("Monarchy respect is serious", "Visitors should treat royal images, currency, ceremonies, and public references to the monarchy with clear respect."),
        ("Island weather varies by coast", "Rain and sea conditions can differ between the Andaman side and Gulf islands. Pick routes based on current coastal conditions."),
    ],
    "turkey": [
        ("Mosque visits have etiquette", "Dress modestly, remove shoes where required, avoid prayer times when asked, and keep voices low inside active mosques."),
        ("Tea is social glue", "Tea invitations, shop conversations, and small hospitality gestures are common. Accepting is friendly, but buying is not required."),
        ("Bazaars differ from normal shops", "Bargaining fits some market settings, but fixed-price boutiques, museums, and restaurants are not bargaining spaces."),
        ("Museum and site tickets can sell out", "Major sites in Istanbul, Cappadocia tours, and Ephesus-area visits work better with current ticket and guide planning."),
    ],
    "vietnam": [
        ("Street crossing has a rhythm", "In busy cities, pedestrians often cross steadily and predictably rather than darting. Watch locals and avoid sudden moves."),
        ("Motorbikes shape the city", "Sidewalks, alleys, deliveries, and cafe life often revolve around motorbikes. Stay aware even in spaces that feel pedestrian."),
        ("Cash and QR payments coexist", "Cities use cards and digital payments increasingly, but markets, street food, and rural stops still often need small dong notes."),
        ("Pagoda etiquette matters", "Dress modestly, keep voices low, and follow incense or photo rules at temples, pagodas, and family memorial spaces."),
    ],
}


COUNTRY_SPECIFIC_GOOD_TO_KNOW.update({
    "argentina": [
        ("Aconcagua is the Americas' highest peak", "Argentina's Aconcagua rises to 6,961 meters in the Andes, making it the highest mountain outside Asia."),
        ("Tango belongs to the Rio de la Plata", "Tango developed around Buenos Aires and Montevideo in the late nineteenth century, shaped by port-city migration and working-class neighborhoods."),
        ("The country spans extreme climates", "Argentina stretches from subtropical areas near Iguazu to the subantarctic landscapes of Tierra del Fuego, so one itinerary can cross major climate zones."),
        ("Mate has a shared ritual", "Mate is often passed around a group from the same gourd and bombilla, with the server controlling the order and refills."),
    ],
    "canada": [
        ("Canada is the second-largest country by area", "Only Russia is larger by total area, which is why domestic flights and long rail or road legs can dominate cross-country routes."),
        ("There are six Canadian time zones", "Canada spans Pacific, Mountain, Central, Eastern, Atlantic, and Newfoundland time zones; Newfoundland is offset by an extra half hour."),
        ("Banff was Canada's first national park", "Banff National Park began in 1885, making it the country's first national park and one of the anchors of Parks Canada history."),
        ("French has federal status", "English and French are Canada's official languages at the federal level, with Quebec and parts of New Brunswick especially important for French-language travel context."),
    ],
    "france": [
        ("France has 18 administrative regions", "The regional system includes mainland regions and overseas regions such as Guadeloupe, Martinique, French Guiana, Reunion, and Mayotte."),
        ("The Louvre began as a fortress", "The Louvre's origins are medieval: parts of the old fortress foundations remain beneath today's museum complex in Paris."),
        ("France uses overseas time zones", "Because of overseas departments and territories, France spans many time zones beyond mainland Europe."),
        ("Provence has Roman layers", "Southern France preserves major Roman sites, including arenas, theaters, aqueduct remains, and towns shaped by ancient Mediterranean routes."),
    ],
    "guatemala": [
        ("The quetzal is both bird and currency", "Guatemala's currency is named for the resplendent quetzal, a bird with deep symbolic importance in the region."),
        ("Maya languages are widely spoken", "Spanish is the national language for most travel interactions, but more than twenty Maya languages are spoken across Guatemalan communities."),
        ("Tikal sits inside a protected reserve", "Tikal National Park is part of the Maya Biosphere Reserve in northern Guatemala, where archaeology and rainforest ecology overlap."),
        ("Volcanoes shape the highlands", "Guatemala has more than thirty volcanoes, and the landscapes around Antigua and Lake Atitlan are directly shaped by volcanic geography."),
    ],
    "iceland": [
        ("Iceland straddles two tectonic plates", "The Mid-Atlantic Ridge crosses Iceland, so parts of the island sit on the boundary between the North American and Eurasian plates."),
        ("The Althing dates to 930", "Iceland's national parliament traces its origins to the Althing assembly founded at Thingvellir in 930."),
        ("There are no passenger railways", "Iceland does not have a public passenger rail network, which is why road routes, flights, buses, and tours shape most visitor movement."),
        ("Geothermal energy is everyday infrastructure", "Geothermal heat is used widely for homes, pools, and public facilities, making hot-water culture part of daily life rather than only a tourist novelty."),
    ],
    "indonesia": [
        ("Indonesia is an archipelago of thousands of islands", "The country is made up of more than 17,000 islands, with Java, Sumatra, Kalimantan, Sulawesi, and Papua among the largest landmasses."),
        ("Bahasa Indonesia links hundreds of languages", "Indonesian is the national language, while hundreds of local languages are also used across islands and communities."),
        ("Bali follows a local calendar too", "Balinese Hindu ritual life uses local calendar systems, including the 210-day Pawukon cycle, alongside the national calendar."),
        ("Komodo dragons are endemic", "Wild Komodo dragons live naturally only in parts of eastern Indonesia, including Komodo and nearby islands."),
    ],
    "italy": [
        ("Italy has 20 regions", "Five Italian regions have special autonomous status: Sicily, Sardinia, Trentino-Alto Adige/Sudtirol, Friuli Venezia Giulia, and Valle d'Aosta."),
        ("Modern Italy is relatively young", "Italian unification was completed in stages during the nineteenth century, with the Kingdom of Italy proclaimed in 1861."),
        ("Italy has exceptional UNESCO density", "Italy is among the countries with the highest number of UNESCO World Heritage properties, reflecting its concentration of archaeological, artistic, and cultural sites."),
        ("ZTL zones protect historic centers", "Many old city centers use limited-traffic zones called ZTLs, a country-specific urban rule that matters in places such as Florence, Rome, and Siena."),
    ],
    "japan": [
        ("Japan has 47 prefectures", "Tokyo is classified as a metropolitan prefecture, not simply a conventional city in Japan's administrative system."),
        ("The Shinkansen began in 1964", "Japan's first bullet train service opened between Tokyo and Osaka in 1964, the same year as the Tokyo Olympics."),
        ("Convenience stores are infrastructure", "Konbini are part of everyday Japanese logistics, offering ticketing, bill payment, parcel services, ATMs, and meals, not just snacks."),
        ("Address order runs large to small", "Japanese addresses typically move from prefecture and municipality down toward district, block, and building, which differs from many Western address habits."),
    ],
    "kenya": [
        ("Kenya has two official languages", "English and Swahili are official languages, with Swahili especially important for everyday greetings and regional connection."),
        ("The Great Rift Valley cuts through Kenya", "Kenya's landscapes include part of the East African Rift system, shaping lakes, escarpments, geothermal areas, and wildlife routes."),
        ("M-Pesa started in Kenya", "The mobile money service M-Pesa launched commercially in Kenya in 2007 and became a major part of daily payments."),
        ("Maasai Mara is part of a larger ecosystem", "The Maasai Mara connects ecologically with Tanzania's Serengeti, forming one of East Africa's best-known wildlife landscapes."),
    ],
    "mexico": [
        ("Mexico has 32 federal entities", "The country is made up of 31 states plus Mexico City, which has its own federal-entity status."),
        ("Mexico City stands on an old lake basin", "Much of Mexico City occupies the former Lake Texcoco basin, the setting of the Mexica capital Tenochtitlan."),
        ("Chocolate has Mesoamerican roots", "Cacao was cultivated and used in Mesoamerica long before modern chocolate, giving Mexico a deep place in chocolate history."),
        ("The peso symbol predates the dollar sign", "The Mexican peso and Spanish-American peso history helped shape the use of the '$' symbol before the U.S. dollar adopted it."),
    ],
    "morocco": [
        ("Arabic and Amazigh are official languages", "Morocco recognizes both Arabic and Amazigh as official languages, while French is also widely used in business, education, and tourism contexts."),
        ("Fez has one of the world's old medinas", "The medina of Fez is a major historic urban fabric, known for dense lanes, craft quarters, mosques, madrasas, and traditional trades."),
        ("The Atlas Mountains divide climates", "The Atlas ranges help separate Atlantic and Mediterranean-influenced areas from desert and pre-Saharan landscapes."),
        ("The dirham is a closed currency", "Moroccan dirhams are generally obtained inside Morocco and cannot be freely exchanged everywhere outside the country."),
    ],
    "new-zealand": [
        ("Te reo Maori is an official language", "New Zealand recognizes English, te reo Maori, and New Zealand Sign Language as official languages."),
        ("Women won national voting rights in 1893", "New Zealand became the first self-governing country where women gained the right to vote in parliamentary elections."),
        ("Aotearoa is widely used", "Aotearoa, a Maori name for New Zealand, appears increasingly in public life, culture, and place-based travel context."),
        ("Biosecurity is a national priority", "Strict border biosecurity protects New Zealand's agriculture and ecosystems, especially from seeds, soil, pests, and untreated natural materials."),
    ],
    "norway": [
        ("Norwegian has two written standards", "Bokmal and Nynorsk are both official written forms of Norwegian, and travelers may see both in public information."),
        ("Norway has the world's longest road tunnel", "The Laerdal Tunnel in western Norway is about 24.5 kilometers long and links fjord-region road routes."),
        ("Fjords are glacial landscapes", "Norway's famous fjords were carved by glaciers, leaving deep, steep-sided sea inlets along the western coast."),
        ("Outdoor access has a legal tradition", "Allemannsretten gives broad public access to uncultivated land, paired with duties around privacy, wildlife, fire, and leaving no trace."),
    ],
    "peru": [
        ("Peru has three broad natural regions", "The coast, Andes, and Amazon create very different climates, foods, transport patterns, and altitude profiles within one country."),
        ("Machu Picchu is a fifteenth-century Inca site", "The site was built in the Andes during the Inca period and is managed through controlled routes and ticket categories today."),
        ("Spanish is not the only official language", "Spanish is official nationwide, and Quechua, Aymara, and other Indigenous languages have official status where they predominate."),
        ("The potato was domesticated in the Andes", "The Andes are one of the world's major centers of potato domestication, with Peru preserving extraordinary potato diversity."),
    ],
    "portugal": [
        ("Portugal is a major cork producer", "Portugal produces a large share of the world's cork, and cork oak landscapes are part of the country's rural economy and ecology."),
        ("Azulejo tiles are protected heritage", "Portugal's painted tile tradition is tied to architecture, religion, public art, and preservation concerns, especially in older cities."),
        ("Mainland Portugal and the Azores differ in time", "Mainland Portugal and Madeira use Western European Time, while the Azores are one hour behind."),
        ("Lisbon is older than many European capitals", "Lisbon's settlement history predates the Roman period, with Phoenician, Roman, Moorish, and later Portuguese layers visible in the city."),
    ],
    "south-africa": [
        ("South Africa has three capitals", "Pretoria is the administrative capital, Cape Town is legislative, and Bloemfontein is judicial."),
        ("The country has 12 official languages", "South Africa recognizes 12 official languages, including South African Sign Language, reflecting its unusually multilingual public life."),
        ("The Cape Floral Region is globally significant", "The Cape Floral Region is one of the world's major biodiversity hotspots, with extraordinary plant diversity around the Western Cape."),
        ("Robben Island is a historic prison site", "Robben Island, near Cape Town, is known internationally for its apartheid-era prison history and Nelson Mandela's imprisonment there."),
    ],
    "spain": [
        ("Spain has 17 autonomous communities", "Spain is organized into 17 autonomous communities plus the autonomous cities of Ceuta and Melilla."),
        ("Several languages are co-official regionally", "Catalan, Basque, Galician, and other languages have official status in specific regions alongside Spanish."),
        ("Spain has one of the largest high-speed rail networks", "The AVE and related high-speed rail services connect many major Spanish cities and shape practical mainland itineraries."),
        ("The Camino de Santiago is a route network", "The Camino is not a single path but a network of pilgrimage routes leading toward Santiago de Compostela."),
    ],
    "thailand": [
        ("Thailand was never formally colonized by a European power", "Unlike many neighboring countries, Thailand maintained sovereignty through the colonial period under the former Kingdom of Siam."),
        ("Bangkok has a ceremonial long name", "Bangkok's Thai ceremonial name is famously long; Krung Thep Maha Nakhon is the commonly used Thai shortened form."),
        ("The Thai calendar uses the Buddhist Era", "Official Thai dates often use the Buddhist Era year, which is 543 years ahead of the Gregorian year."),
        ("Theravada Buddhism shapes public life", "Temples, monkhood, merit-making, and Buddhist holidays are highly visible parts of Thailand's social and cultural landscape."),
    ],
    "turkey": [
        ("Istanbul spans two continents", "The Bosphorus separates the European and Asian sides of Istanbul, making the city a literal bridge between continents."),
        ("The Turkish alphabet changed in 1928", "Modern Turkish uses a Latin-based alphabet introduced in 1928 as part of early republican reforms."),
        ("Cappadocia is shaped by volcanic tuff", "The region's caves, valleys, and fairy-chimney formations come from soft volcanic rock eroded over time."),
        ("Ephesus preserves a major ancient city", "Near Selcuk, Ephesus is one of the Mediterranean's important ancient urban archaeological sites."),
    ],
    "vietnam": [
        ("Vietnamese uses the Latin alphabet", "Modern written Vietnamese uses quoc ngu, a Latin-based script with tone and vowel diacritics."),
        ("Vietnam has a long S-shaped coastline", "The country's coastline runs for more than 3,000 kilometers, strongly shaping food, climate, trade, and routes."),
        ("The Reunification Express links north and south", "The main north-south railway connects Hanoi and Ho Chi Minh City along a route often used for multi-stop travel."),
        ("Water puppetry is a northern tradition", "Vietnamese water puppetry developed in Red River Delta village culture and remains closely associated with northern Vietnam."),
    ],
})


COUNTRY_LOCAL_PHRASES = {
    "argentina": [("Hello", "Hola", "oh-lah"), ("Thank you", "Gracias", "grah-see-ahs"), ("Please", "Por favor", "por fah-vor"), ("Yes", "Si", "see"), ("No", "No", "noh"), ("Excuse me", "Disculpa", "dees-kool-pah"), ("How much does it cost?", "Cuanto cuesta?", "kwan-toh kwes-tah"), ("Where is...?", "Donde esta...?", "dohn-deh es-tah"), ("I do not understand", "No entiendo", "noh en-tyen-doh")],
    "canada": [("Hello", "Hello / Bonjour", "heh-loh / bon-zhoor"), ("Thank you", "Thank you / Merci", "thank you / mehr-see"), ("Please", "Please / S'il vous plait", "pleez / seel voo pleh"), ("Yes", "Yes / Oui", "yes / wee"), ("No", "No / Non", "noh / nohn"), ("Excuse me", "Excuse me / Excusez-moi", "ex-kyoos me / ex-kew-zay mwah"), ("Where is...?", "Where is...? / Ou est...?", "wair iz / oo eh"), ("How much is it?", "How much is it? / C'est combien?", "how much iz it / seh kom-byen"), ("Goodbye", "Goodbye / Au revoir", "good-bye / oh ruh-vwar")],
    "france": [("Hello", "Bonjour", "bon-zhoor"), ("Thank you", "Merci", "mehr-see"), ("Please", "S'il vous plait", "seel voo pleh"), ("Yes", "Oui", "wee"), ("No", "Non", "nohn"), ("Excuse me", "Excusez-moi", "ex-kew-zay mwah"), ("Where is...?", "Ou est...?", "oo eh"), ("How much is it?", "C'est combien?", "seh kom-byen"), ("I do not understand", "Je ne comprends pas", "zhuh nuh kom-prahn pah")],
    "indonesia": [("Hello", "Halo", "hah-loh"), ("Thank you", "Terima kasih", "teh-ree-mah kah-see"), ("Please", "Tolong", "toh-long"), ("Yes", "Ya", "yah"), ("No", "Tidak", "tee-dak"), ("Excuse me", "Permisi", "per-mee-see"), ("How much?", "Berapa?", "buh-rah-pah"), ("Where is...?", "Di mana...?", "dee mah-nah"), ("I do not understand", "Saya tidak mengerti", "sah-yah tee-dak muh-ngair-tee")],
    "italy": [("Hello", "Ciao / Buongiorno", "chow / bwon-jor-noh"), ("Thank you", "Grazie", "graht-see-eh"), ("Please", "Per favore", "pair fah-voh-reh"), ("Yes", "Si", "see"), ("No", "No", "noh"), ("Excuse me", "Mi scusi", "mee skoo-zee"), ("Where is...?", "Dov'e...?", "doh-veh"), ("How much is it?", "Quanto costa?", "kwan-toh koh-stah"), ("I do not understand", "Non capisco", "nohn kah-pees-koh")],
    "japan": [("Hello", "Konnichiwa", "kon-nee-chee-wah"), ("Thank you", "Arigato", "ah-ree-gah-toh"), ("Please", "Onegaishimasu", "oh-neh-gai-shee-mahs"), ("Yes", "Hai", "high"), ("No", "Iie", "ee-eh"), ("Excuse me", "Sumimasen", "soo-mee-mah-sen"), ("Where is...?", "... wa doko desu ka?", "wah doh-koh dess kah"), ("How much is it?", "Ikura desu ka?", "ee-koo-rah dess kah"), ("I do not understand", "Wakarimasen", "wah-kah-ree-mah-sen")],
    "kenya": [("Hello", "Jambo", "jahm-boh"), ("Thank you", "Asante", "ah-sahn-teh"), ("Please", "Tafadhali", "tah-fah-dhah-lee"), ("Yes", "Ndiyo", "n-dee-yoh"), ("No", "Hapana", "hah-pah-nah"), ("Excuse me", "Samahani", "sah-mah-hah-nee"), ("How much?", "Ni pesa ngapi?", "nee peh-sah ngah-pee"), ("Where is...?", "... iko wapi?", "ee-koh wah-pee"), ("Goodbye", "Kwaheri", "kwah-heh-ree")],
    "mexico": [("Hello", "Hola", "oh-lah"), ("Thank you", "Gracias", "grah-syahs"), ("Please", "Por favor", "por fah-vor"), ("Yes", "Si", "see"), ("No", "No", "noh"), ("Excuse me", "Disculpe", "dees-kool-peh"), ("How much does it cost?", "Cuanto cuesta?", "kwan-toh kwes-tah"), ("Where is...?", "Donde esta...?", "dohn-deh es-tah"), ("I do not understand", "No entiendo", "noh en-tyen-doh")],
    "morocco": [("Hello", "Salam", "sah-lam"), ("Thank you", "Shukran", "shook-ran"), ("Please", "Afak", "ah-fak"), ("Yes", "Iyyeh", "ee-yeh"), ("No", "La", "lah"), ("Excuse me", "Smah liya", "smah lee-yah"), ("How much?", "Bshhal?", "bsh-hal"), ("Where is...?", "Fin kayn...?", "feen kai-en"), ("Goodbye", "Bslama", "b-slah-mah")],
    "new-zealand": [("Hello", "Kia ora", "kee ah aw-rah"), ("Thank you", "Thank you / Kia ora", "thank you / kee ah aw-rah"), ("Please", "Please", "pleez"), ("Yes", "Yes / Ae", "yes / eye"), ("No", "No / Kao", "noh / kah-oh"), ("Goodbye", "Ka kite", "kah kee-teh"), ("Excuse me", "Excuse me", "ex-kyoos me"), ("Where is...?", "Where is...?", "wair iz"), ("Help", "Help", "help")],
    "norway": [("Hello", "Hei", "hi"), ("Thank you", "Takk", "tahk"), ("Please", "Vaer sa snill", "var saw snill"), ("Yes", "Ja", "yah"), ("No", "Nei", "nye"), ("Excuse me", "Unnskyld", "oon-shill"), ("Where is...?", "Hvor er...?", "voor air"), ("How much does it cost?", "Hvor mye koster det?", "voor mee-eh kos-ter deh"), ("Goodbye", "Ha det", "hah deh")],
    "peru": [("Hello", "Hola", "oh-lah"), ("Thank you", "Gracias", "grah-syahs"), ("Please", "Por favor", "por fah-vor"), ("Yes", "Si", "see"), ("No", "No", "noh"), ("How much?", "Cuanto cuesta?", "kwan-toh kwes-tah"), ("Excuse me", "Disculpe", "dees-kool-peh"), ("Where is...?", "Donde esta...?", "dohn-deh es-tah"), ("I do not understand", "No entiendo", "noh en-tyen-doh")],
    "portugal": [("Hello", "Ola", "oh-lah"), ("Thank you", "Obrigado / Obrigada", "oh-bree-gah-doo / dah"), ("Please", "Por favor", "poor fah-vor"), ("Yes", "Sim", "seeng"), ("No", "Nao", "nowng"), ("Excuse me", "Com licenca", "kohng lee-sen-sah"), ("Where is...?", "Onde fica...?", "ohn-deh fee-kah"), ("How much is it?", "Quanto custa?", "kwan-toh koos-tah"), ("I do not understand", "Nao entendo", "nowng en-ten-doo")],
    "south-africa": [("Hello", "Hello / Sawubona", "heh-loh / sah-woo-boh-nah"), ("Thank you", "Thank you / Enkosi", "thank you / en-kaw-see"), ("Please", "Please / Asseblief", "pleez / ah-suh-bleef"), ("Yes", "Yes / Yebo", "yes / yeh-boh"), ("No", "No / Nee", "noh / nee"), ("Excuse me", "Excuse me", "ex-kyoos me"), ("Where is...?", "Where is...?", "wair iz"), ("How much is it?", "How much is it?", "how much iz it"), ("Goodbye", "Goodbye / Hamba kahle", "good-bye / hahm-bah gah-sheh")],
    "thailand": [("Hello", "Sawasdee", "sah-wah-dee"), ("Thank you", "Khob khun", "khop khun"), ("Please", "Karuna", "kah-roo-nah"), ("Yes", "Chai", "chai"), ("No", "Mai chai", "my chai"), ("How much?", "Tao rai?", "tao rye"), ("Excuse me", "Khor thot", "kaw tote"), ("Where is...?", "... yu thi nai?", "yoo tee nai"), ("I do not understand", "Mai khao jai", "my cow jai")],
    "turkey": [("Hello", "Merhaba", "mehr-hah-bah"), ("Thank you", "Tesekkurler", "teh-shehk-oor-lehr"), ("Please", "Lutfen", "loot-fen"), ("Yes", "Evet", "eh-vet"), ("No", "Hayir", "hah-yuhr"), ("Excuse me", "Affedersiniz", "ah-feh-dehr-see-neez"), ("Where is...?", "... nerede?", "neh-reh-deh"), ("How much?", "Ne kadar?", "neh kah-dar"), ("I do not understand", "Anlamiyorum", "ahn-lah-muh-yo-room")],
    "vietnam": [("Hello", "Xin chao", "sin chow"), ("Thank you", "Cam on", "gahm uhn"), ("Please", "Lam on", "lahm uhn"), ("Yes", "Co", "gaw"), ("No", "Khong", "khom"), ("Excuse me", "Xin loi", "sin loy"), ("How much?", "Bao nhieu?", "bow nyew"), ("Where is...?", "... o dau?", "uh dow"), ("I do not understand", "Toi khong hieu", "toy khom hyew")],
}


def local_phrases_for_country(slug: str, phrases: list[tuple[str, str, str]]):
    curated_phrases = COUNTRY_LOCAL_PHRASES.get(slug, phrases)
    merged = [*phrases]

    for phrase in curated_phrases:
        if len(merged) >= 9:
            break

        if phrase not in merged:
            merged.append(phrase)

    return (COUNTRY_LOCAL_PHRASES.get(slug) or merged)[:9]


def build_compact_destination(
    *,
    slug: str,
    name: str,
    country_code: str,
    region: str,
    currency_name: str,
    currency_code: str,
    languages: list[str],
    timezone: str,
    emergency_numbers: list[str],
    travel_styles: list[str],
    featured_category: str,
    journey_title: str,
    journey_intro: str,
    overview: str,
    phrases: list[tuple[str, str, str]],
    source_record: dict,
    image_url: str,
    places: list[dict],
    weather_summary: str,
    temperature_range: str,
    rainfall_summary: str,
    seasonal_highlights: list[str],
    seasonal_activities: list[str],
    affordability: str,
):
    country_notes = COUNTRY_SPECIFIC_GOOD_TO_KNOW.get(slug)
    country = {
        "slug": slug,
        "name": name,
        "country_code": country_code,
        "region": region,
        "currency": {"name": currency_name, "code": currency_code},
        "languages": languages,
        "timezone": timezone,
        "emergency_numbers": emergency_numbers,
        "visa_entry_summary": text_note(
            "Entry requirements vary by nationality",
            "Travelers should verify current passport, visa, eTA, or entry rules with official sources before departure.",
            [source_record],
        ),
        "travel_styles": travel_styles,
        "hero_media": media(image_url, f"{name} travel landscape", source_record),
        "featured_category": featured_category,
        "journey_title": journey_title,
        "journey_intro": journey_intro,
        "overview": overview,
        "culture_notes": [
            text_note(
                "Local identity",
                f"{name} rewards travelers who respect regional identity, food traditions, public spaces, and local pace.",
                [source_record],
            )
        ],
        "etiquette_notes": [
            text_note(
                "Be locally observant",
                "Greet people politely, ask before photographing people, and follow posted rules at religious, natural, and heritage sites.",
                [source_record],
            )
        ],
        "communication_notes": [
            text_note(
                "Language basics help",
                "English may be available in visitor areas, but simple local greetings make everyday exchanges easier.",
                [source_record],
            )
        ],
        "common_visitor_mistakes": [] if country_notes else [
            text_note(
                "Overpacking the itinerary",
                "Travel times, weather, crowds, and regional distances can make rushed plans feel brittle.",
                [source_record],
            )
        ],
        "local_insights": [
            {
                "title": title,
                "category": "local-knowledge",
                "content": content,
                "sources": [source_record],
            }
            for title, content in country_notes
        ] if country_notes else [
            {
                "title": "Start with regional context",
                "category": "culture",
                "content": "Food, etiquette, transport, and daily rhythm can shift meaningfully between regions.",
                "sources": [source_record],
            },
            {
                "title": "Let season shape the route",
                "category": "seasonal-rhythm",
                "content": "August plans work best when heat, rain, daylight, and peak-season demand are treated as planning inputs.",
                "sources": [source_record],
            },
        ],
        "local_phrases": [
            {
                "english": english,
                "local": local,
                "pronunciation": pronunciation,
                "usage_note": "Useful for simple, polite visitor interactions.",
                "sources": [source_record],
            }
            for english, local, pronunciation in local_phrases_for_country(slug, phrases)
        ],
        "practical_notes": [] if country_notes else [
            text_note(
                "Money and payment",
                f"{name} uses the {currency_name}. Carry a backup payment method and some small local cash where appropriate.",
                [source_record],
            ),
            text_note(
                "Emergency",
                f"Emergency numbers commonly used by visitors include: {', '.join(emergency_numbers)}.",
                [source_record],
            ),
        ],
        "sources": [source_record],
    }
    monthly_factor = {
        "year": 2026,
        "month": 8,
        "country_slug": slug,
        "weather_climate": {
            "summary": weather_summary,
            "temperature_range": temperature_range,
            "rainfall_summary": rainfall_summary,
            "daylight_summary": "August daylight generally supports full travel days, with local variation by latitude.",
            "sources": [source_record],
        },
        "weather_suitability_input": weather_summary,
        "daylight_information": "Plan early starts for outdoor highlights and keep flexibility for evenings.",
        "seasonal_conditions": [
            text_note("August travel season", weather_summary, [source_record])
        ],
        "seasonal_highlights": seasonal_highlights,
        "accessibility_information": "Major visitor routes are accessible, but local transport, tickets, and weather checks still matter.",
        "seasonal_activities": seasonal_activities,
        "event_activity_density_input": "August supports visitor activity; specific event dates should be verified with official organizers.",
        "affordability_value_input": affordability,
        "travel_conditions": [
            text_note(
                "Book key logistics early",
                "Popular routes, accommodation, and guided experiences can sell out during busy periods.",
                [source_record],
            )
        ],
        "seasonal_warnings": [
            text_note(
                "Seasonal awareness",
                "Check official guidance for weather, health, safety, and site access before travel.",
                [source_record],
            )
        ],
        "sources": [source_record],
    }
    return {
        "country": country,
        "places": places,
        "monthly_factors": [monthly_factor],
    }


def validate_compact_destination(dataset: dict):
    country = DestinationCountryCreate(**dataset["country"])
    places = [DestinationPlaceCreate(**place_data) for place_data in dataset["places"]]
    monthly_factors = [
        DestinationMonthlyFactorsCreate(**monthly_factor)
        for monthly_factor in dataset["monthly_factors"]
    ]
    invalid_places = [
        place_data.slug
        for place_data in places
        if place_data.country_slug != country.slug
    ]
    invalid_months = [
        monthly_factor.month
        for monthly_factor in monthly_factors
        if monthly_factor.country_slug != country.slug
    ]

    if invalid_places:
        raise ValueError(f"Places reference unknown country_slug: {invalid_places}")

    if invalid_months:
        raise ValueError(f"Monthly factors reference unknown country_slug: {invalid_months}")

    return {
        "country_slug": country.slug,
        "place_slugs": [place_data.slug for place_data in places],
        "monthly_factors": [
            {"year": monthly_factor.year, "month": monthly_factor.month}
            for monthly_factor in monthly_factors
        ],
    }
