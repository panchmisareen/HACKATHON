"""
Carbon Footprint Calculation Engine
Combines:
1. 5 Core Modern Categories (Transportation, Home Energy, Food/Agriculture, Goods/Digital Life, Waste/Circularity)
2. Gen Z Daily Footprint Engine (streaming, doomscrolling, AI queries, fast fashion, delivery habits, micro-commute)
3. Indian Benchmarks & Comprehensive Carbon Footprint Engine (electricity bill, AC cooling, LPG, vehicle mileage, flights, diet, waste segregation)
4. Standardized Criteria on What to Include vs. Delete/Exclude (based on IPCC, GHG Protocol, DEFRA, EPA, Wren, Commons, Pawprint)
"""

from typing import Dict, Any, List

# ==========================================
# 1. EXPANDED GEN Z & SCIENTIFIC CATEGORIES & EMISSION FACTORS (g CO2e)
# ==========================================
REGIONAL_GRID_FACTORS = {
    "India (CEA Baseline)": {"factor_kg_kwh": 0.82, "source": "Central Electricity Authority (CEA) India Baseline v19", "desc": "Coal-dominant national grid with rapid solar additions"},
    "US Average (EPA eGRID)": {"factor_kg_kwh": 0.385, "source": "US EPA eGRID 2024", "desc": "Mixed natural gas, renewables, nuclear, and coal"},
    "UK National Grid (DEFRA)": {"factor_kg_kwh": 0.207, "source": "UK DEFRA GHG Conversion Factors 2024", "desc": "High wind & gas mix with phased-out coal"},
    "EU Continental Average": {"factor_kg_kwh": 0.230, "source": "European Environment Agency (EEA) 2024", "desc": "Interconnected European grid mix"},
    "France (Nuclear / Hydro)": {"factor_kg_kwh": 0.052, "source": "RTE France / IPCC 2024", "desc": "Over 70% nuclear generation + alpine hydro"},
    "Australia (NEM)": {"factor_kg_kwh": 0.680, "source": "National Greenhouse Accounts (NGA) Factors", "desc": "High coal intensity with growing rooftop solar"},
    "California (CAISO)": {"factor_kg_kwh": 0.215, "source": "California Air Resources Board (CARB)", "desc": "High solar penetration, hydro, and imported green power"},
}

DELIVERY_LOGISTICS_FACTORS = {
    "petrol_scooter": {"factor_kg_km": 0.110, "label": "Petrol Scooter / Bike", "desc": "110g CO2e per km driven"},
    "ev_two_wheeler": {"factor_kg_km": 0.020, "label": "EV Two-Wheeler Fleet", "desc": "20g CO2e per km on average grid"},
    "local_walker_bicycle": {"factor_kg_km": 0.000, "label": "Local Walking / Bicycle Courier", "desc": "Zero tailpipe emissions"},
    "delivery_van": {"factor_kg_km": 0.220, "label": "Delivery Van / Auto", "desc": "220g CO2e per km"},
    "packaging_baseline": 0.550, # 550g CO2e per takeout container, wrapper, bag set
}

SCIENTIFIC_CITATIONS = [
    {
        "standard": "UK DEFRA / DESNZ 2024",
        "title": "Government Greenhouse Gas Conversion Factors for Company Reporting",
        "scope": "Scope 1 (Fuels), Scope 2 (Grid Electricity), Scope 3 (Passenger Travel & Logistics)",
        "url": "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    },
    {
        "standard": "IPCC Sixth Assessment Report (AR6)",
        "title": "Working Group III: Mitigation of Climate Change (Chapter 5: Demand, Services & Social Aspects)",
        "scope": "Global baseline diets, enteric fermentation, aviation radiative forcing (1.9x)",
        "url": "https://www.ipcc.ch/report/ar6/wg3/",
    },
    {
        "standard": "US EPA eGRID 2024",
        "title": "Emissions & Generation Resource Integrated Database",
        "scope": "Subregional and national electricity grid emission factors",
        "url": "https://www.epa.gov/egrid",
    },
    {
        "standard": "CEA India CO2 Baseline Database (v19)",
        "title": "Central Electricity Authority Baseline Database for the Indian Power Sector",
        "scope": "National grid average 0.82 kg CO2e / kWh operating margin",
        "url": "https://cea.nic.in/cdm-co2-baseline-database/",
    },
    {
        "standard": "GHG Protocol",
        "title": "Corporate Value Chain (Scope 3) Standard & Product Life Cycle Standard",
        "scope": "End-to-end supply chain accounting principles & boundaries",
        "url": "https://ghgprotocol.org/",
    },
]

GENZ_CATEGORIES = {
    "digital": {
        "title": "Digital & Screen Time",
        "icon": "📱",
        "description": "Server energy, high-bitrate streaming, AI queries, and cloud storage",
        "items": [
            {
                "id": "stream_4k",
                "name": "4K Video Streaming",
                "subtext": "Netflix, YouTube, Prime in UHD",
                "unit": "hours",
                "factor": 150.0,
                "default": 2.0,
                "step": 0.5,
            },
            {
                "id": "doomscroll_reels",
                "name": "Doomscrolling Short Videos",
                "subtext": "TikTok, Instagram Reels, YouTube Shorts",
                "unit": "hours",
                "factor": 65.0,
                "default": 1.5,
                "step": 0.5,
            },
            {
                "id": "genai_queries",
                "name": "GenAI Prompts & Queries",
                "subtext": "Chatbots, code copilots, image generation",
                "unit": "prompts",
                "factor": 4.5,
                "default": 10.0,
                "step": 5.0,
            },
            {
                "id": "cloud_gaming",
                "name": "Online & Cloud Gaming",
                "subtext": "High-draw GPU servers and multiplayer sync",
                "unit": "hours",
                "factor": 125.0,
                "default": 0.0,
                "step": 0.5,
            },
            {
                "id": "cloud_storage_hoard",
                "name": "Dormant Cloud Storage",
                "subtext": "Every 10 GB of uncleaned photo/video cloud hoard",
                "unit": "10 GB blocks",
                "factor": 20.0,
                "default": 3.0,
                "step": 1.0,
            },
        ],
    },
    "food_dining": {
        "title": "Delivery, Food & Beverages",
        "icon": "🥗",
        "description": "Logistics distance, packaging lifecycle, dietary emissions & beverage choices",
        "items": [
            {
                "id": "food_delivery_order",
                "name": "App Food Delivery (Distance-calibrated)",
                "subtext": "Courier travel distance + container and packaging footprint",
                "unit": "orders",
                "factor": 1850.0,
                "default": 1.0,
                "step": 1.0,
            },
            {
                "id": "beverages_dairy_caffeine",
                "name": "Beverages (Coffee, Tea & Dairy Milk)",
                "subtext": "Cow's milk coffee/tea/boba + single-use cup production",
                "unit": "cups",
                "factor": 550.0,
                "default": 1.0,
                "step": 1.0,
            },
            {
                "id": "beverages_plant_based",
                "name": "Plant-Based Beverages (Oat / Soy / Black Tea)",
                "subtext": "Plant-milk coffee, steeped tea, or reusable tumbler refill",
                "unit": "cups",
                "factor": 180.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "packaged_beverage",
                "name": "Single-Use Canned/Bottled Drinks & Sodas",
                "subtext": "Energy drinks, cold sodas, plastic bottled water",
                "unit": "cans/bottles",
                "factor": 160.0,
                "default": 1.0,
                "step": 1.0,
            },
            {
                "id": "red_meat_meal",
                "name": "Mutton / Beef / High-Methane Meal",
                "subtext": "Ruminant livestock feed, land use, and enteric fermentation",
                "unit": "meals",
                "factor": 3300.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "takeout_food_waste",
                "name": "Leftover Food Wasted",
                "subtext": "Uneaten takeout sent to decompose in landfills",
                "unit": "servings",
                "factor": 900.0,
                "default": 0.0,
                "step": 0.5,
            },
        ],
    },
    "shopping": {
        "title": "Fast Fashion & E-Commerce",
        "icon": "🛍️",
        "description": "Micro-trends, circular thrifting, return loops, and rush shipping",
        "items": [
            {
                "id": "fast_fashion_piece",
                "name": "Fast-Fashion Clothing Item",
                "subtext": "Synthetic micro-trend purchase (Zara, H&M, Shein)",
                "unit": "items",
                "factor": 7500.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "online_returns",
                "name": "Item Returned via Courier",
                "subtext": "Ordering multiple sizes to return remainder ('bracketing')",
                "unit": "returns",
                "factor": 2400.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "same_day_delivery",
                "name": "Same-Day / Rush Delivery",
                "subtext": "Unconsolidated direct logistics dispatch",
                "unit": "orders",
                "factor": 1200.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "annual_phone_upgrade",
                "name": "Frequent Smartphone Upgrade",
                "subtext": "Annual device swap embodied manufacturing footprint (~70 kg / yr)",
                "unit": "annualized days",
                "factor": 190.0,
                "default": 0.0,
                "step": 1.0,
            },
        ],
    },
    "commute_lifestyle": {
        "title": "Commute, Cooling & Micro-Habits",
        "icon": "🛴",
        "description": "Convenience transit, room cooling, and standby devices",
        "items": [
            {
                "id": "short_ride_hail",
                "name": "Solo Cab/Auto under 3 km",
                "subtext": "Cab or auto-rickshaw instead of walking/cycling",
                "unit": "rides",
                "factor": 650.0,
                "default": 1.0,
                "step": 1.0,
            },
            {
                "id": "shared_escooter",
                "name": "Shared E-Scooter / E-Bike Fleet",
                "subtext": "Dockless micro-mobility (van rebalancing & battery swaps)",
                "unit": "km",
                "factor": 160.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "room_ac_cooling",
                "name": "Bedroom AC Cooling (Split 1.5 Ton)",
                "subtext": "High summer grid load (~1.2 kWh per hour on coal-heavy grid)",
                "unit": "hours",
                "factor": 980.0,
                "default": 2.0,
                "step": 1.0,
            },
            {
                "id": "disposable_vape",
                "name": "Disposable Vape Thrown Out",
                "subtext": "Single-use lithium battery and plastic casing",
                "unit": "vapes",
                "factor": 2800.0,
                "default": 0.0,
                "step": 1.0,
            },
            {
                "id": "phantom_power_charging",
                "name": "Standby Rig / Leftover Adapters",
                "subtext": "Monitors, consoles, and chargers plugged in all day",
                "unit": "days",
                "factor": 320.0,
                "default": 1.0,
                "step": 1.0,
            },
        ],
    },
}

EQUIVALENCIES = {
    "smartphone_charges": 8.22,     # ~8.22g CO2e per smartphone recharge
    "km_petrol_car": 120.0,         # ~120g CO2e per km driven in average petrol car
    "tree_absorption_daily": 55.0,  # ~55g CO2 absorbed per day by a mature tree
}

# ==========================================
# 2. STANDARDIZED CRITERIA: WHAT TO INCLUDE VS DELETE/EXCLUDE
# (Adopted from IPCC, GHG Protocol, DEFRA, Wren, Commons & Pawprint)
# ==========================================
TRACKER_CRITERIA = {
    "principles": [
        {
            "name": "Individual Agency",
            "description": "Activities must be under direct consumer choice (e.g. food, transport, heating/cooling, purchases).",
        },
        {
            "name": "Materiality",
            "description": "Focus on high-impact categories that represent >90% of a personal footprint (energy, transport, diet, goods).",
        },
        {
            "name": "Actionability",
            "description": "Every measured item must provide a realistic reduction or substitution pathway for the user.",
        },
    ],
    "what_to_include": [
        {
            "pillar": "1. Transportation",
            "items": [
                "Direct tailpipe emissions from personal petrol and diesel vehicles (Scope 1)",
                "EV grid charging emissions (Scope 2)",
                "Aviation: Commercial flights with radiative forcing (~1.9x high-altitude non-CO2 factor)",
                "Public transit: Metro, city buses, and passenger rail (passenger-km basis)",
                "Modern mobility: Solo ride-hailing with 'deadheading' empty travel penalty and shared e-scooter rebalancing fleets",
            ],
            "rationale": "Transportation represents 20-30% of average personal emissions and offers immediate modal shift alternatives.",
        },
        {
            "pillar": "2. Home Energy & Housing",
            "items": [
                "Grid electricity bills (₹ / kWh) calibrated by regional generation mix",
                "Air conditioning (AC) and heating run hours (high peak load in urban summers/winters)",
                "Cooking fuels: LPG cylinders (42.5 kg CO2e), Piped Natural Gas (PNG), or Induction",
                "Rooftop solar net-metering offsets (up to 80% grid reduction)",
                "Standby vampire electronics and gaming PC rig loads",
            ],
            "rationale": "Directly measurable from utility bills and device habits.",
        },
        {
            "pillar": "3. Food and Agriculture",
            "items": [
                "Dietary baselines: Vegan (100 kg/mo), Vegetarian (130 kg/mo), Eggetarian (155 kg/mo), Non-Veg (220 kg/mo)",
                "Enteric methane from ruminants (mutton, beef, dairy cattle)",
                "Dairy vs plant milk (oat, soy, almond) lifecycle footprint",
                "App food delivery: courier logistics + single-use plastic/paper takeout packaging",
                "Food waste decomposition into landfill methane",
            ],
            "rationale": "Food systems produce 25-30% of global greenhouse gases; diet shift is one of the highest leverage personal actions.",
        },
        {
            "pillar": "4. Goods, Services & Digital Life",
            "items": [
                "Fast fashion manufacturing: Synthetic polyester, water heating, dye supply chain (~7.5 kg / garment)",
                "Circular economy credit: Second-hand / thrifted clothing (0 kg manufacturing footprint)",
                "E-commerce rush delivery and return loops ('bracketing' multiple sizes to send back)",
                "Digital infrastructure: 4K UHD video streaming, TikTok/Reels scrolling, GenAI cloud inference, cloud gaming, dormant storage hoards",
                "Annual consumer electronics replacement cycle (smartphones embody ~70-80 kg CO2e to produce)",
            ],
            "rationale": "Gen Z and modern urban lifestyles concentrate significant indirect Scope 3 emissions in digital cloud and micro-consumerism.",
        },
        {
            "pillar": "5. Waste and Circularity",
            "items": [
                "Non-biodegradable and single-use plastic waste generation",
                "Waste segregation and composting credits (35% reduction in landfill anaerobic methane)",
                "E-waste & disposable vapes (single-use lithium battery extraction and hazardous disposal)",
            ],
            "rationale": "Waste habits determine downstream methane release at municipal dumping grounds.",
        },
    ],
    "what_to_delete_or_exclude": [
        {
            "category": "National Public Infrastructure Construction",
            "why_excluded": "Emissions from building bridges, highways, public dams, and government complexes belong to government and public sector accounting. Allocating them to individual consumers causes double counting and disempowers users since they have no direct purchasing agency.",
        },
        {
            "category": "Military & Sovereign Defense Expenditures",
            "why_excluded": "Sovereign defense fuel burn and equipment manufacturing cannot be influenced by personal lifestyle choices and are treated as state overhead.",
        },
        {
            "category": "Upstream Heavy Industrial Raw Material Extraction",
            "why_excluded": "Blast furnace steelmaking and bauxite smelting belong to corporate Scope 1/2 reporting. Consumer trackers capture the finished product lifecycle rather than primary mining extraction overhead.",
        },
        {
            "category": "Ephemeral Micro-Friction Actions (Single search queries, tapping buttons)",
            "why_excluded": "Individual Google searches (~0.2g) or tiny web visits create high cognitive friction and tracker fatigue without moving the needle. Modern trackers aggregate these into meaningful screen time or prompt batches (e.g. 10 GenAI prompts).",
        },
        {
            "category": "Deep Corporate Scope 3 (Tier 3-4 sub-supplier audits)",
            "why_excluded": "Cannot be verified by a consumer without certified Environmental Product Declarations (EPDs). Personal trackers use peer-reviewed lifecycle averages instead.",
        },
    ],
}


def calculate_genz_footprint(user_inputs: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate daily Gen Z micro-habit footprint in grams and kg."""
    total_grams = 0.0
    category_totals = {}
    item_breakdown = []

    for cat_key, cat_data in GENZ_CATEGORIES.items():
        cat_subtotal = 0.0
        for item in cat_data["items"]:
            qty = float(user_inputs.get(item["id"], 0.0) or 0.0)
            if qty > 0:
                item_emissions = qty * item["factor"]
                cat_subtotal += item_emissions
                item_breakdown.append({
                    "id": item["id"],
                    "name": item["name"],
                    "category": cat_key,
                    "qty": qty,
                    "unit": item["unit"],
                    "grams": round(item_emissions, 1),
                })
        category_totals[cat_key] = round(cat_subtotal, 1)
        total_grams += cat_subtotal

    if total_grams <= 1200:
        vibe_status = "🌱 Climate Chill"
        vibe_badge = "chill"
        vibe_desc = "Low server draw, zero fast-fashion, and light transit footprint. Outstanding baseline!"
    elif total_grams <= 4000:
        vibe_status = "⚡ Moderate Streamer"
        vibe_badge = "moderate"
        vibe_desc = "Typical urban student baseline. Food deliveries, AC cooling, and 4K streaming add up."
    else:
        vibe_status = "🔥 High Carbon Mode"
        vibe_badge = "high"
        vibe_desc = "Heavy mix of rush deliveries, fast fashion, room AC, or short solo cabs!"

    # Actionable micro tips based on inputs
    tips = []
    if float(user_inputs.get("stream_4k", 0)) > 2:
        tips.append("Switching streaming resolution from 4K to 1080p reduces cloud transmission energy by ~65%.")
    if float(user_inputs.get("room_ac_cooling", 0)) > 2:
        tips.append("Setting room AC to 25°C instead of 18°C cuts compressor electricity draw by ~24%.")
    if float(user_inputs.get("food_delivery_order", 0)) >= 1:
        tips.append("Dining in or batching food orders saves packaging waste and avoids ~1.85 kg CO2e courier logistics.")
    if float(user_inputs.get("short_ride_hail", 0)) >= 1:
        tips.append("Switching sub-3km cab/auto rides to active walking or cycling avoids ~650g CO2e per trip.")
    if float(user_inputs.get("fast_fashion_piece", 0)) >= 1:
        tips.append("Thrifting or restyling instead of buying synthetic fast fashion avoids ~7.5 kg CO2e per garment.")
    if float(user_inputs.get("dairy_latte_boba", 0)) >= 1:
        tips.append("Swapping dairy milk for oat or soy milk saves ~350g CO2e per latte.")
    if not tips:
        tips.append("Great job maintaining light screen-time, zero-waste hydration, and active commute today!")

    return {
        "total_grams": round(total_grams, 1),
        "total_kg": round(total_grams / 1000.0, 2),
        "category_totals": category_totals,
        "item_breakdown": item_breakdown,
        "vibe_status": vibe_status,
        "vibe_badge": vibe_badge,
        "vibe_desc": vibe_desc,
        "tips": tips,
        "equivalents": {
            "smartphone_charges": int(round(total_grams / EQUIVALENCIES["smartphone_charges"])),
            "car_km": round(total_grams / EQUIVALENCIES["km_petrol_car"], 1),
            "tree_days": round(total_grams / EQUIVALENCIES["tree_absorption_daily"], 1),
        },
    }


# ==========================================
# 3. INDIAN BENCHMARKS & COMPREHENSIVE 5-PILLAR FACTORS
# ==========================================
INDIAN_EMISSION_FACTORS = {
    # Electricity: ~0.82 kg CO2e per kWh; average ₹8 per unit in India -> 0.1025 kg / ₹
    "electricity_per_rupee": 0.1025,
    # LPG Cylinder (14.2 kg): ~42.5 kg CO2e per cylinder
    "lpg_cylinder": 42.5,
    # Fuel (kg CO2e per litre)
    "petrol_per_litre": 2.31,
    "diesel_per_litre": 2.68,
    "ev_per_km": 0.05,
    # Flights (kg CO2e per trip approx with radiative forcing)
    "flight_domestic": 150.0,
    "flight_international": 900.0,
    # Public transport weekly impact (kg CO2e / month)
    "public_transport": {"Daily": 5.0, "Weekly": 12.0, "Rarely": 25.0, "Never": 40.0},
    # Diet monthly base (kg CO2e / month)
    "diet": {"Vegan": 100.0, "Vegetarian": 130.0, "Eggetarian": 155.0, "Non-Vegetarian": 220.0},
    # Red meat frequency (monthly addition in kg)
    "red_meat": {"Never": 0.0, "Occasionally": 15.0, "Weekly": 40.0, "Daily": 90.0},
    # Waste (kg CO2e per kg of waste)
    "food_waste_factor": 1.9,
    "plastic_waste_factor": 2.5,
}

BENCHMARKS = {
    "india_national_average_annual_tonnes": 1.9,
    "india_urban_youth_annual_tonnes": 2.8,
    "global_average_annual_tonnes": 4.7,
    "paris_agreement_2030_target_tonnes": 2.0,
}


def calculate_india_footprint(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate comprehensive monthly and annual carbon footprint
    tailored to Indian energy grid, consumption, transport, and Gen Z lifestyles.
    """
    household = max(1.0, float(inputs.get("householdSize", 1.0) or 1.0))

    # 1. Energy
    elec_bill = float(inputs.get("elecBill", 0.0) or 0.0)
    renewable = inputs.get("renewable", "No")
    renewable_multiplier = 0.2 if renewable == "Yes" else 1.0
    elec_emissions = (elec_bill * INDIAN_EMISSION_FACTORS["electricity_per_rupee"]) * renewable_multiplier

    cooking_fuel = inputs.get("cookingFuel", "LPG")
    lpg_count = float(inputs.get("lpgCount", 0.0) or 0.0)
    if cooking_fuel == "LPG":
        cooking_emissions = lpg_count * INDIAN_EMISSION_FACTORS["lpg_cylinder"]
    elif cooking_fuel == "PNG":
        cooking_emissions = lpg_count * 32.0  # PNG average equivalent
    else:  # Induction
        cooking_emissions = lpg_count * 18.0

    energy_monthly = (elec_emissions + cooking_emissions) / household

    # 2. Transport
    v_type = inputs.get("vehicleType", "None")
    km_week = float(inputs.get("kmPerWeek", 0.0) or 0.0)
    mileage = max(1.0, float(inputs.get("fuelEfficiency", 15.0) or 15.0))
    km_month = km_week * 4.3

    fuel_monthly = 0.0
    if v_type == "Petrol":
        fuel_monthly = (km_month / mileage) * INDIAN_EMISSION_FACTORS["petrol_per_litre"]
    elif v_type == "Diesel":
        fuel_monthly = (km_month / mileage) * INDIAN_EMISSION_FACTORS["diesel_per_litre"]
    elif v_type == "EV":
        fuel_monthly = km_month * INDIAN_EMISSION_FACTORS["ev_per_km"]

    pub_choice = inputs.get("publicTransport", "Weekly")
    pub_monthly = INDIAN_EMISSION_FACTORS["public_transport"].get(pub_choice, 12.0)

    dom_flights = float(inputs.get("domesticFlights", 0.0) or 0.0)
    intl_flights = float(inputs.get("intlFlights", 0.0) or 0.0)
    flights_monthly = ((dom_flights * INDIAN_EMISSION_FACTORS["flight_domestic"]) +
                       (intl_flights * INDIAN_EMISSION_FACTORS["flight_international"])) / 12.0

    transport_monthly = fuel_monthly + pub_monthly + flights_monthly

    # 3. Food
    diet_choice = inputs.get("dietType", "Vegetarian")
    diet_monthly = INDIAN_EMISSION_FACTORS["diet"].get(diet_choice, 130.0)

    red_meat_choice = inputs.get("redMeat", "Never")
    red_meat_monthly = INDIAN_EMISSION_FACTORS["red_meat"].get(red_meat_choice, 0.0)

    food_waste_week_kg = float(inputs.get("foodWaste", 0.0) or 0.0)
    food_waste_monthly = (food_waste_week_kg * 4.3 * INDIAN_EMISSION_FACTORS["food_waste_factor"]) / household

    food_total_monthly = diet_monthly + red_meat_monthly + food_waste_monthly

    # 4. Waste
    plastic_kg_week = float(inputs.get("plasticWaste", 0.0) or 0.0)
    segregate = inputs.get("segregateWaste", "No")
    segregate_multiplier = 0.65 if segregate == "Yes" else 1.0
    waste_monthly = ((plastic_kg_week * 4.3 * INDIAN_EMISSION_FACTORS["plastic_waste_factor"]) / household) * segregate_multiplier

    # 5. Gen Z & Digital Lifestyle
    stream_hours = float(inputs.get("stream4k", 0.0) or 0.0)
    scroll_hours = float(inputs.get("doomscroll", 0.0) or 0.0)
    ai_prompts = float(inputs.get("aiPrompts", 0.0) or 0.0)
    food_orders = float(inputs.get("foodOrders", 0.0) or 0.0)
    fashion_items = float(inputs.get("fastFashion", 0.0) or 0.0)
    short_cabs = float(inputs.get("shortCabs", 0.0) or 0.0)

    digital_monthly = (
        (stream_hours * 0.15 * 30.0) +
        (scroll_hours * 0.065 * 30.0) +
        ((ai_prompts / 10.0) * 0.045 * 30.0)
    )
    youth_lifestyle_monthly = (
        (food_orders * 1.85) +
        (fashion_items * 7.5) +
        (short_cabs * 0.65) +
        digital_monthly
    )

    # Totals
    total_monthly = energy_monthly + transport_monthly + food_total_monthly + waste_monthly + youth_lifestyle_monthly
    total_annual_tonnes = (total_monthly * 12.0) / 1000.0

    # Percentages
    breakdown = {
        "energy": round(energy_monthly, 1),
        "transport": round(transport_monthly, 1),
        "food": round(food_total_monthly, 1),
        "waste": round(waste_monthly, 1),
        "genz_lifestyle": round(youth_lifestyle_monthly, 1),
    }

    percentages = {}
    if total_monthly > 0:
        for k, v in breakdown.items():
            percentages[k] = round((v / total_monthly) * 100.0, 1)

    # Benchmark comparison
    vs_india_avg = round(((total_annual_tonnes - BENCHMARKS["india_national_average_annual_tonnes"]) / BENCHMARKS["india_national_average_annual_tonnes"]) * 100.0, 1)
    vs_global_avg = round(((total_annual_tonnes - BENCHMARKS["global_average_annual_tonnes"]) / BENCHMARKS["global_average_annual_tonnes"]) * 100.0, 1)

    # Smart High Impact Recommendations
    smart_recommendations = []
    if transport_monthly > 45:
        smart_recommendations.append({
            "action": "Metro / EV First Commute",
            "potential_saving_kg_month": round(transport_monthly * 0.4, 1),
            "tip": "Taking the Delhi Metro or active cycling for campus trips can save up to 40% of transit emissions.",
        })
    if youth_lifestyle_monthly > 25:
        smart_recommendations.append({
            "action": "Consolidate Deliveries & Lower Stream Res",
            "potential_saving_kg_month": round(youth_lifestyle_monthly * 0.35, 1),
            "tip": "Swapping 2 app food orders/week for campus canteen meals saves ~15 kg CO2e monthly.",
        })
    if energy_monthly > 35 and renewable != "Yes":
        smart_recommendations.append({
            "action": "Rooftop Solar & Smart Power Strips",
            "potential_saving_kg_month": round(energy_monthly * 0.45, 1),
            "tip": "Enabling rooftop solar net-metering and turning off vampire appliances cuts bill by up to 50%.",
        })
    if segregate != "Yes":
        smart_recommendations.append({
            "action": "Compost & Segregate Wet/Dry Waste",
            "potential_saving_kg_month": round(waste_monthly * 0.35, 1),
            "tip": "Segregating recyclables avoids landfill methane and earns community green credits.",
        })

    return {
        "total_monthly_kg": round(total_monthly, 1),
        "total_annual_tonnes": round(total_annual_tonnes, 2),
        "breakdown": breakdown,
        "percentages": percentages,
        "benchmarks": BENCHMARKS,
        "comparison": {
            "vs_india_avg_percent": vs_india_avg,
            "vs_global_avg_percent": vs_global_avg,
            "status": "Lower than Indian average!" if total_annual_tonnes <= 1.9 else ("Close to Indian urban baseline" if total_annual_tonnes <= 3.0 else "Above urban average"),
        },
        "recommendations": smart_recommendations,
    }


# ==========================================
# 4. UNIFIED ALL-IN-ONE CALCULATION ENGINE
# (Seamless combination of Indian Benchmarks + Gen Z Micro-Habits into a single list)
# ==========================================
def calculate_unified_footprint(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unified calculation that combines all Indian utility/transit factors
    with daily Gen Z digital, delivery, and fashion micro-habits.
    Outputs daily, monthly, and annual metrics in a single cohesive model.
    """
    household = max(1.0, float(inputs.get("householdSize", 1.0) or 1.0))

    # --- 1. Transportation & Micro-Mobility ---
    v_type = inputs.get("vehicleType", "None")
    km_week = float(inputs.get("kmPerWeek", 0.0) or 0.0)
    mileage = max(1.0, float(inputs.get("fuelEfficiency", 15.0) or 15.0))
    km_month = km_week * 4.3

    fuel_monthly = 0.0
    if v_type == "Petrol":
        fuel_monthly = (km_month / mileage) * INDIAN_EMISSION_FACTORS["petrol_per_litre"]
    elif v_type == "Diesel":
        fuel_monthly = (km_month / mileage) * INDIAN_EMISSION_FACTORS["diesel_per_litre"]
    elif v_type == "EV":
        fuel_monthly = km_month * INDIAN_EMISSION_FACTORS["ev_per_km"]

    pub_choice = inputs.get("publicTransport", "Weekly")
    pub_monthly = INDIAN_EMISSION_FACTORS["public_transport"].get(pub_choice, 12.0)

    dom_flights = float(inputs.get("domesticFlights", 0.0) or 0.0)
    intl_flights = float(inputs.get("intlFlights", 0.0) or 0.0)
    flights_monthly = ((dom_flights * INDIAN_EMISSION_FACTORS["flight_domestic"]) +
                       (intl_flights * INDIAN_EMISSION_FACTORS["flight_international"])) / 12.0

    short_cabs = float(inputs.get("shortCabs", 0.0) or 0.0)
    cabs_monthly = short_cabs * 0.65  # 650g per solo ride

    shared_escooter_km = float(inputs.get("sharedEscooterKm", 0.0) or 0.0)
    escooter_monthly = shared_escooter_km * 0.16  # 160g per km

    transport_monthly = fuel_monthly + pub_monthly + flights_monthly + cabs_monthly + escooter_monthly

    # --- 2. Home Energy, AC Cooling & Standby ---
    grid_region = inputs.get("gridRegion", "India (CEA Baseline)")
    grid_meta = REGIONAL_GRID_FACTORS.get(grid_region, REGIONAL_GRID_FACTORS["India (CEA Baseline)"])
    grid_factor_kwh = grid_meta["factor_kg_kwh"]

    renewable = inputs.get("renewable", "No")
    renewable_mult = 0.2 if renewable == "Yes" else 1.0

    # Automated Utility API direct metered kWh vs monthly bill fallback
    utility_kwh = float(inputs.get("utilityKwh", 0.0) or 0.0)
    if utility_kwh > 0:
        elec_monthly = (utility_kwh * grid_factor_kwh) * renewable_mult
        elec_data_source = f"Automated Smart Meter ({utility_kwh:.1f} kWh @ {grid_factor_kwh} kg CO2/kWh)"
    else:
        elec_bill = float(inputs.get("elecBill", 0.0) or 0.0)
        # Average rate ₹8/kWh calibrated to selected grid intensity
        estimated_kwh = elec_bill / 8.0
        elec_monthly = (estimated_kwh * grid_factor_kwh) * renewable_mult
        elec_data_source = f"Bill Estimate ({estimated_kwh:.1f} kWh @ {grid_factor_kwh} kg CO2/kWh)"

    ac_hours = float(inputs.get("acCoolingHours", 0.0) or 0.0)
    # AC power draw calibrated to selected regional grid
    ac_kwh_per_hour = 1.2 # average 1.5 ton inverter AC draw
    ac_monthly = ac_hours * 30.0 * (ac_kwh_per_hour * grid_factor_kwh)

    cooking_fuel = inputs.get("cookingFuel", "LPG")
    lpg_count = float(inputs.get("lpgCount", 0.0) or 0.0)
    if cooking_fuel == "LPG":
        cooking_monthly = lpg_count * INDIAN_EMISSION_FACTORS["lpg_cylinder"]
    elif cooking_fuel == "PNG":
        cooking_monthly = lpg_count * 32.0
    else:
        # Electric induction powered by selected grid
        cooking_monthly = (lpg_count * 25.0 * grid_factor_kwh)

    standby_rig = inputs.get("standbyRig", "Yes")
    standby_monthly = (0.40 * grid_factor_kwh * 30.0) if standby_rig == "Yes" else 0.0

    energy_monthly = (elec_monthly + ac_monthly + cooking_monthly + standby_monthly) / household

    # --- 3. Food, Cafe Habits & App Delivery (Localized Logistics + Beverages) ---
    diet_choice = inputs.get("dietType", "Vegetarian")
    diet_monthly = INDIAN_EMISSION_FACTORS["diet"].get(diet_choice, 130.0)

    red_meat = inputs.get("redMeat", "Never")
    meat_monthly = INDIAN_EMISSION_FACTORS["red_meat"].get(red_meat, 0.0)

    # Localized Logistics Matrix for Deliveries:
    food_orders = float(inputs.get("foodOrders", 0.0) or 0.0)
    delivery_km = float(inputs.get("deliveryDistanceKm", 5.0) or 5.0)
    fleet_mode = inputs.get("deliveryFleetMode", "petrol_scooter")
    fleet_info = DELIVERY_LOGISTICS_FACTORS.get(fleet_mode, DELIVERY_LOGISTICS_FACTORS["petrol_scooter"])
    delivery_transport_per_order = delivery_km * fleet_info["factor_kg_km"]
    packaging_per_order = DELIVERY_LOGISTICS_FACTORS["packaging_baseline"]
    food_orders_monthly = food_orders * (delivery_transport_per_order + packaging_per_order)

    # Accurate Beverage Terminology & Matrix:
    dairy_beverages = float(inputs.get("dairyLattes", inputs.get("beveragesDairy", 0.0)) or 0.0)
    plant_beverages = float(inputs.get("beveragesPlant", 0.0) or 0.0)
    canned_beverages = float(inputs.get("beveragesCanned", inputs.get("packagedBeverages", 0.0)) or 0.0)
    
    # 550g for cow milk dairy coffee/tea/boba, 180g for plant-based oat/soy/black tea, 160g for canned soda
    beverages_monthly = (dairy_beverages * 0.550) + (plant_beverages * 0.180) + (canned_beverages * 0.160)

    food_waste_week = float(inputs.get("foodWasteKg", 0.0) or 0.0)
    food_waste_monthly = (food_waste_week * 4.3 * INDIAN_EMISSION_FACTORS["food_waste_factor"]) / household

    food_monthly = diet_monthly + meat_monthly + food_orders_monthly + beverages_monthly + food_waste_monthly

    # --- 4. E-Commerce, Fast Fashion & Consumer Tech ---
    fast_fashion = float(inputs.get("fastFashion", 0.0) or 0.0)
    fashion_monthly = fast_fashion * 7.5  # 7.5 kg per garment

    online_returns = float(inputs.get("onlineReturns", 0.0) or 0.0)
    returns_monthly = online_returns * 2.4  # 2.4 kg per return loop

    same_day_delivery = float(inputs.get("sameDayDelivery", 0.0) or 0.0)
    rush_monthly = same_day_delivery * 1.2  # 1.2 kg per rush dispatch

    phone_upgrade = inputs.get("phoneUpgradeYears", "2 years")
    if phone_upgrade == "1 year":
        phone_monthly = 5.8
    elif phone_upgrade == "2 years":
        phone_monthly = 2.9
    else:
        phone_monthly = 1.4

    shopping_monthly = fashion_monthly + returns_monthly + rush_monthly + phone_monthly

    # --- 5. Digital Infrastructure & Screen Time ---
    stream_4k = float(inputs.get("stream4kHours", 0.0) or 0.0)
    stream_monthly = stream_4k * 30.0 * 0.15  # 150g per hour

    doomscroll = float(inputs.get("doomscrollHours", 0.0) or 0.0)
    scroll_monthly = doomscroll * 30.0 * 0.065  # 65g per hour

    ai_prompts = float(inputs.get("aiPromptsDaily", 0.0) or 0.0)
    ai_monthly = (ai_prompts / 10.0) * 30.0 * 0.045  # 45g per 10 prompts

    cloud_gaming = float(inputs.get("cloudGamingHours", 0.0) or 0.0)
    gaming_monthly = cloud_gaming * 30.0 * 0.125  # 125g per hour

    cloud_blocks = float(inputs.get("cloudStorageBlocks", 0.0) or 0.0)
    storage_monthly = cloud_blocks * 0.02  # 20g per 10 GB

    digital_monthly = stream_monthly + scroll_monthly + ai_monthly + gaming_monthly + storage_monthly

    # --- 6. Waste Management & Circularity ---
    plastic_kg_week = float(inputs.get("plasticWasteKg", 0.0) or 0.0)
    segregate = inputs.get("segregateWaste", "No")
    segregate_mult = 0.65 if segregate == "Yes" else 1.0
    plastic_monthly = ((plastic_kg_week * 4.3 * INDIAN_EMISSION_FACTORS["plastic_waste_factor"]) / household) * segregate_mult

    disposable_vapes = float(inputs.get("disposableVapes", 0.0) or 0.0)
    vapes_monthly = disposable_vapes * 2.8  # 2.8 kg per vape

    waste_monthly = plastic_monthly + vapes_monthly

    # --- Aggregate Totals ---
    total_monthly = transport_monthly + energy_monthly + food_monthly + shopping_monthly + digital_monthly + waste_monthly
    total_annual_tonnes = (total_monthly * 12.0) / 1000.0
    daily_avg_kg = total_monthly / 30.0
    daily_avg_grams = daily_avg_kg * 1000.0

    # Vibe Status
    if daily_avg_grams <= 1800:
        vibe_status = "🌱 Climate Chill"
        vibe_badge = "chill"
        vibe_desc = "Low energy draw, active transit, plant-forward diet & minimal fast fashion!"
    elif daily_avg_grams <= 4800:
        vibe_status = "⚡ Moderate Streamer"
        vibe_badge = "moderate"
        vibe_desc = "Balanced urban student profile. Room AC, food deliveries, and streaming make up the core."
    else:
        vibe_status = "🔥 High Carbon Mode"
        vibe_badge = "high"
        vibe_desc = "Heavy reliance on cabs, rush deliveries, room AC, or synthetic fast fashion!"

    # Breakdown Dictionary
    breakdown = {
        "transport": round(transport_monthly, 1),
        "energy": round(energy_monthly, 1),
        "food": round(food_monthly, 1),
        "shopping": round(shopping_monthly, 1),
        "digital": round(digital_monthly, 1),
        "waste": round(waste_monthly, 1),
    }

    percentages = {}
    if total_monthly > 0:
        for k, v in breakdown.items():
            percentages[k] = round((v / total_monthly) * 100.0, 1)

    # Equivalents
    equivalents = {
        "smartphone_charges_daily": int(round(daily_avg_grams / EQUIVALENCIES["smartphone_charges"])),
        "car_km_daily": round(daily_avg_grams / EQUIVALENCIES["km_petrol_car"], 1),
        "tree_days_daily": round(daily_avg_grams / EQUIVALENCIES["tree_absorption_daily"], 1),
        "smartphone_charges_monthly": int(round((total_monthly * 1000.0) / EQUIVALENCIES["smartphone_charges"])),
        "car_km_monthly": round((total_monthly * 1000.0) / EQUIVALENCIES["km_petrol_car"], 1),
        "tree_days_monthly": round((total_monthly * 1000.0) / EQUIVALENCIES["tree_absorption_daily"], 1),
    }

    # Benchmark Comparisons
    vs_india_avg = round(((total_annual_tonnes - BENCHMARKS["india_national_average_annual_tonnes"]) / BENCHMARKS["india_national_average_annual_tonnes"]) * 100.0, 1)
    vs_global_avg = round(((total_annual_tonnes - BENCHMARKS["global_average_annual_tonnes"]) / BENCHMARKS["global_average_annual_tonnes"]) * 100.0, 1)

    # Smart High Impact Reduction Roadmap
    recommendations = []
    if transport_monthly > 40:
        recommendations.append({
            "action": "Metro / Active Cycling First",
            "potential_saving_kg_month": round(transport_monthly * 0.45, 1),
            "tip": "Swapping solo cabs and short rides for Metro or walking avoids up to ~45% of transport emissions.",
        })
    if ac_monthly > 35:
        recommendations.append({
            "action": "Set Split AC to 25°C",
            "potential_saving_kg_month": round(ac_monthly * 0.24, 1),
            "tip": "Setting room AC to 25°C instead of 18°C cuts electricity draw by ~24% without sacrificing comfort.",
        })
    if food_orders_monthly > 15:
        recommendations.append({
            "action": "Batch Delivery & Dine In",
            "potential_saving_kg_month": round(food_orders_monthly * 0.4, 1),
            "tip": "Reducing app deliveries by 2/week avoids courier transit and single-use packaging.",
        })
    if shopping_monthly > 15:
        recommendations.append({
            "action": "Thrift & Avoid Bracketing Returns",
            "potential_saving_kg_month": round(shopping_monthly * 0.5, 1),
            "tip": "Buying second-hand avoids garment manufacturing, and eliminating return courier runs saves 2.4 kg CO2e each.",
        })
    if stream_monthly > 8:
        recommendations.append({
            "action": "Stream in 1080p FHD instead of 4K",
            "potential_saving_kg_month": round(stream_monthly * 0.6, 1),
            "tip": "Dropping stream bitrate on phone/laptop cuts data center energy transmission by ~60%.",
        })
    if not recommendations:
        recommendations.append({
            "action": "Maintain Green Routine",
            "potential_saving_kg_month": 5.0,
            "tip": "Your footprint is well within the sustainable Indian climate chill baseline!",
        })

    # Real-World Relatable Scales & Milestone Analogies:
    # 1 kg CO2 occupies ~556 liters of gas = approx 36 standard 11-inch party balloons
    balloons_monthly = int(round(total_monthly * 36))
    # Mature oak tree absorbs ~55g CO2/day -> ~20 kg CO2/year -> ~1.67 kg/month
    oak_tree_days_monthly = int(round((total_monthly * 1000.0) / 55.0))

    # Shadow Carbon Pricing Mode ($80 / metric ton compliance rate)
    shadow_price_per_tonne_usd = 80.0
    shadow_debt_annual_usd = round(total_annual_tonnes * shadow_price_per_tonne_usd, 2)
    shadow_debt_monthly_usd = round((total_monthly / 1000.0) * shadow_price_per_tonne_usd, 2)
    shadow_debt_annual_inr = round(shadow_debt_annual_usd * 84.0, 2)

    return {
        "daily_avg_grams": round(daily_avg_grams, 1),
        "daily_avg_kg": round(daily_avg_kg, 2),
        "total_monthly_kg": round(total_monthly, 1),
        "total_annual_tonnes": round(total_annual_tonnes, 2),
        "vibe_status": vibe_status,
        "vibe_badge": vibe_badge,
        "vibe_desc": vibe_desc,
        "breakdown": breakdown,
        "percentages": percentages,
        "equivalents": equivalents,
        "benchmarks": BENCHMARKS,
        "comparison": {
            "vs_india_avg_percent": vs_india_avg,
            "vs_global_avg_percent": vs_global_avg,
            "status": "Lower than Indian average!" if total_annual_tonnes <= 1.9 else ("Close to Indian urban youth baseline" if total_annual_tonnes <= 3.0 else "Above urban average"),
        },
        "recommendations": recommendations,
        "milestone_analogies": {
            "birthday_balloons": balloons_monthly,
            "oak_tree_absorption_days": oak_tree_days_monthly,
            "smartphone_charges": equivalents["smartphone_charges_monthly"],
            "car_km_avoided": equivalents["car_km_monthly"],
        },
        "shadow_carbon_pricing": {
            "price_per_tonne_usd": shadow_price_per_tonne_usd,
            "monthly_debt_usd": shadow_debt_monthly_usd,
            "annual_debt_usd": shadow_debt_annual_usd,
            "annual_debt_inr": shadow_debt_annual_inr,
            "social_cost_description": "Based on IPCC & US EPA social cost of carbon ($80/ton). Real environmental debt invoice.",
        },
        "citations": SCIENTIFIC_CITATIONS,
        "regional_grid_active": {
            "region": grid_region,
            "factor_kg_kwh": grid_factor_kwh,
            "source": grid_meta["source"],
            "desc": grid_meta["desc"],
        },
        "logistics_matrix": {
            "delivery_km": delivery_km,
            "fleet_mode": fleet_mode,
            "fleet_label": fleet_info["label"],
            "fleet_factor": fleet_info["factor_kg_km"],
        },
    }

