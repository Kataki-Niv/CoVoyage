from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


NZ_SOURCE = source("100% Pure New Zealand", "https://www.newzealand.com/nz/", notes="Official site for Tourism New Zealand.")


def get_new_zealand_seed_dataset():
    return build_compact_destination(
        slug="new-zealand", name="New Zealand", country_code="NZ", region="Oceania",
        currency_name="New Zealand dollar", currency_code="NZD", languages=["English", "Te reo Maori"],
        timezone="Pacific/Auckland", emergency_numbers=["111"],
        travel_styles=["Nature", "Road Trips", "Hiking", "Adventure", "Wine", "Wildlife"],
        featured_category="Outdoor Adventure", journey_title="Aotearoa Scenic South and North",
        journey_intro="A road-friendly route through geothermal culture, alpine scenery, and coastal cities.",
        overview="New Zealand offers mountains, fjords, beaches, geothermal landscapes, Maori culture, wine regions, wildlife, and a strong outdoor travel ethic.",
        phrases=[("Hello", "Kia ora", "kee ah aw-rah"), ("Thank you", "Thank you", "thank you"), ("Goodbye", "Ka kite", "kah kee-teh")],
        source_record=NZ_SOURCE, image_url="https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("queenstown", "new-zealand", "Queenstown", "Otago", "Alpine adventure base", "Queenstown sits by Lake Wakatipu with alpine views, adventure activities, wineries, and access to Fiordland routes.", ["Alpine views", "Adventure", "Lake Wakatipu", "Wine", "Day trips"], ["mountains", "adventure", "wine", "lake", "road-trip"], ["Hiking", "Adventure sports", "Wine", "Photography"], NZ_SOURCE, "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=900&q=84"),
            place("rotorua", "new-zealand", "Rotorua", "Bay of Plenty", "Geothermal and Maori culture hub", "Rotorua combines geothermal landscapes, Maori cultural experiences, forest trails, lakes, and wellness.", ["Geothermal areas", "Maori culture", "Forest trails", "Lakes", "Wellness"], ["geothermal", "culture", "forest", "wellness", "lakes"], ["Culture", "Forest walks", "Geothermal visits", "Wellness"], NZ_SOURCE, "https://images.unsplash.com/photo-1480497490787-505ec076689f?auto=format&fit=crop&w=900&q=84"),
            place("auckland", "new-zealand", "Auckland", "Auckland Region", "Harbor city and island gateway", "Auckland mixes harbors, neighborhoods, volcanic cones, food, nearby islands, and an easy international arrival point.", ["Harbors", "Islands", "Food", "Volcanic cones", "Museums"], ["city", "harbor", "food", "islands", "walking"], ["Museums", "Food", "Ferry trips", "Walking"], NZ_SOURCE, "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is winter in New Zealand, bringing snow-sport opportunities, cool weather, and variable road conditions in alpine regions.",
        temperature_range="Cool to cold, especially in the South Island and alpine areas.",
        rainfall_summary="Rain and snow vary by region; alpine weather can change quickly.",
        seasonal_highlights=["Snow sports", "Geothermal wellness", "City food", "Scenic drives", "Winter landscapes"],
        seasonal_activities=["Skiing", "Geothermal visits", "Food", "Museums", "Road trips"],
        affordability="Winter can offer value outside ski hubs, while Queenstown and alpine areas need early booking.",
    )


def validate_new_zealand_seed_dataset():
    return validate_compact_destination(get_new_zealand_seed_dataset())
