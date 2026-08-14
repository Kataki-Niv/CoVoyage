from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


CANADA_SOURCE = source("Destination Canada", "https://travel.destinationcanada.com/en-us", notes="Official travel guide from Destination Canada.")


def get_canada_seed_dataset():
    return build_compact_destination(
        slug="canada", name="Canada", country_code="CA", region="North America",
        currency_name="Canadian dollar", currency_code="CAD", languages=["English", "French"],
        timezone="America/Toronto", emergency_numbers=["911"],
        travel_styles=["Nature", "Cities", "Road Trips", "Wildlife", "Food", "National Parks"],
        featured_category="Parks and Cities", journey_title="Toronto to Rockies Summer Route",
        journey_intro="A broad route through multicultural cities, lakes, mountains, and national parks.",
        overview="Canada offers large-scale natural landscapes, national parks, multicultural cities, Indigenous cultures, coastlines, lakes, wildlife, and major seasonal contrast.",
        phrases=[("Hello", "Hello", "heh-loh"), ("Thank you", "Thank you", "thank you"), ("Thank you in French", "Merci", "mehr-see")],
        source_record=CANADA_SOURCE, image_url="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("toronto", "canada", "Toronto", "Ontario", "Multicultural city and lakefront base", "Toronto brings food neighborhoods, museums, waterfront, music, sports, and easy trips to Niagara.", ["Food neighborhoods", "Museums", "Waterfront", "Music", "Niagara access"], ["city", "food", "museums", "waterfront", "culture"], ["Food", "Museums", "Walking", "Day trips"], CANADA_SOURCE, "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=900&q=84"),
            place("banff", "canada", "Banff", "Alberta", "Rocky Mountain national park town", "Banff is a mountain base for lakes, hiking, wildlife viewing, scenic drives, and national-park landscapes.", ["Rocky Mountains", "Lakes", "Hiking", "Wildlife", "Scenic drives"], ["mountains", "parks", "wildlife", "hiking", "road-trip"], ["Hiking", "Photography", "Wildlife viewing", "Scenic drives"], CANADA_SOURCE, "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=84"),
            place("vancouver", "canada", "Vancouver", "British Columbia", "Coastal city and nature gateway", "Vancouver blends ocean, mountains, food, parks, neighborhoods, ferries, and access to Whistler and Vancouver Island.", ["Ocean", "Mountains", "Food", "Parks", "Ferries"], ["coast", "city", "food", "nature", "parks"], ["Food", "Cycling", "Parks", "Day trips"], CANADA_SOURCE, "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is summer across Canada, strong for parks, road trips, lakes, festivals, and city exploring, with regional heat or wildfire-smoke awareness.",
        temperature_range="Warm in many southern regions; cooler in mountains and northern areas.",
        rainfall_summary="Regional variation is high; storms or dry spells can affect outdoor plans.",
        seasonal_highlights=["National parks", "Lakes", "Cities", "Road trips", "Outdoor dining"],
        seasonal_activities=["Hiking", "Museums", "Food", "Road trips", "Wildlife viewing"],
        affordability="Canada can be expensive in peak summer, especially national parks and major city hotels.",
    )


def validate_canada_seed_dataset():
    return validate_compact_destination(get_canada_seed_dataset())
