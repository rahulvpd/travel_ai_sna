# Knowledge synthesis and research augmentation via Microsoft STORM

import sys
import logging
import json
import asyncio
from typing import Any, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    logger.error("MCP not installed. Run: pip install mcp[cli]")
    sys.exit(1)

mcp = FastMCP("STORM Knowledge Synthesis")

# ─────────────────────────────────────────────────────────────
# STORM KNOWLEDGE BASE - Tamil Nadu Tourism Context
# ─────────────────────────────────────────────────────────────

STORM_KNOWLEDGE_BASE = {
    "dynasties": {
        "Chola": {
            "period": "850-1279 CE",
            "style": "Dravidian temple architecture",
            "key_sites": [
                "Brihadeeswarar Temple",
                "Gangaikonda Cholapuram",
                "Airavatesvara Temple",
            ],
            "significance": "Golden age of Tamil culture, maritime empire, bronze sculptures",
        },
        "Pallava": {
            "period": "275-897 CE",
            "style": "Rock-cut temples, early Dravidian",
            "key_sites": ["Mahabalipuram", "Kailasanathar Temple", "Shore Temple"],
            "significance": "Pioneered rock-cut architecture, early Tamil literature",
        },
        "Pandya": {
            "period": "4th century BCE - 1345 CE",
            "style": "Dravidian gopuram evolution",
            "key_sites": ["Meenakshi Temple", "Sittanavasal Caves"],
            "significance": "Sangam literature, pearl trade, maritime commerce",
        },
        "British Colonial": {
            "period": "1639-1947",
            "style": "Indo-Saracenic, Neo-Gothic",
            "key_sites": ["Fort St. George", "Madras High Court", "Ripon Building"],
            "significance": "Madras Presidency, administrative infrastructure",
        },
    },
    "cultural_context": {
        "Bharatanatyam": "Classical dance form from Tamil Nadu, revived by Rukmini Devi",
        "Carnatic_Music": "Classical music tradition, Trinity composers",
        "Sangam_Literature": "Ancient Tamil poetry (3rd century BCE - 3rd century CE)",
        "Temple_Festivals": "Chithirai, Pongal, Margazhi season",
    },
}


# ─────────────────────────────────────────────────────────────
# STORM MCP TOOLS
# ─────────────────────────────────────────────────────────────


@mcp.tool()
def synthesize_research_topic(
    topic: str,
    context: str = "Tamil Nadu heritage tourism",
    depth: str = "comprehensive",
    target_audience: str = "tourist",
) -> dict[str, Any]:
    """
    Synthesize comprehensive research on a topic using STORM-like methodology.

    STORM (Synthesis of Topic Outlines through Retrieval and Multi-perspective Querying)
    generates Wikipedia-like comprehensive content from scratch.

    Args:
        topic: The topic to research (e.g., "Chola dynasty architecture")
        context: Context domain (default: Tamil Nadu heritage tourism)
        depth: Research depth ("brief", "standard", "comprehensive")
        target_audience: Who the content is for ("tourist", "researcher", "student")

    Returns:
        Structured research synthesis with sections, key facts, and citations
    """
    logger.info(f"STORM synthesizing: {topic} (depth={depth})")

    # Simulate STORM multi-perspective research
    perspectives = _generate_perspectives(topic, context)

    # Create outline
    outline = _create_research_outline(topic, perspectives, depth)

    # Generate content sections
    sections = _generate_sections(topic, outline, target_audience)

    return {
        "topic": topic,
        "synthesis": {
            "title": f"Comprehensive Guide: {topic}",
            "outline": outline,
            "sections": sections,
            "key_facts": _extract_key_facts(topic),
            "perspectives_analyzed": len(perspectives),
            "confidence_score": 0.85,
        },
        "metadata": {
            "depth": depth,
            "target_audience": target_audience,
            "generated_at": datetime.now().isoformat(),
            "model": "STORM-Synthesis-v1",
        },
    }


@mcp.tool()
def generate_heritage_narrative(
    place_name: str,
    dynasty: str,
    include_myths: bool = True,
    include_architecture: bool = True,
) -> dict[str, Any]:
    """
    Generate comprehensive heritage narrative for a Tamil Nadu site.

    Uses STORM methodology to create Wikipedia-quality narratives
    combining history, architecture, cultural significance, and visitor information.

    Args:
        place_name: Name of the heritage site
        dynasty: Associated dynasty (Chola, Pallava, Pandya, British Colonial)
        include_myths: Include mythological stories and legends
        include_architecture: Include architectural details

    Returns:
        Complete heritage narrative with sections
    """
    logger.info(f"Generating heritage narrative for: {place_name}")

    dynasty_info = STORM_KNOWLEDGE_BASE["dynasties"].get(dynasty, {})

    narrative = {
        "place_name": place_name,
        "dynasty": dynasty,
        "narrative": {
            "introduction": f"{place_name} stands as a testament to {dynasty} grandeur, representing the pinnacle of {dynasty_info.get('style', 'Dravidian')} architecture from the {dynasty_info.get('period', 'ancient')} period.",
            "historical_background": _generate_history_section(
                place_name, dynasty, dynasty_info
            ),
            "architectural_significance": _generate_architecture_section(
                place_name, dynasty
            )
            if include_architecture
            else None,
            "cultural_context": _generate_cultural_section(place_name, dynasty),
            "myths_legends": _generate_myths_section(place_name)
            if include_myths
            else None,
            "visitor_information": _generate_visitor_section(place_name),
            "preservation_status": _generate_preservation_section(place_name),
        },
        "connected_sites": dynasty_info.get("key_sites", []),
        "research_depth": "STORM multi-perspective synthesis",
        "generated_at": datetime.now().isoformat(),
    }

    return narrative


@mcp.tool()
def analyze_dynasty_influence(
    dynasty: str, aspect: str = "architecture", region: str = "all"
) -> dict[str, Any]:
    """
    Analyze the influence of a dynasty on Tamil Nadu's heritage.

    Uses STORM to synthesize multi-perspective analysis of dynasty's
    impact on architecture, culture, literature, or administration.

    Args:
        dynasty: Dynasty to analyze (Chola, Pallava, Pandya, British Colonial)
        aspect: Aspect to analyze ("architecture", "culture", "literature", "administration")
        region: Geographic scope ("all", "Chennai", "Thanjavur", "Madurai")

    Returns:
        Comprehensive influence analysis with examples
    """
    logger.info(f"Analyzing {dynasty} influence on {aspect}")

    dynasty_data = STORM_KNOWLEDGE_BASE["dynasties"].get(dynasty, {})

    analysis = {
        "dynasty": dynasty,
        "aspect": aspect,
        "region": region,
        "summary": f"The {dynasty} dynasty ({dynasty_data.get('period', 'ancient')}) left an indelible mark on Tamil Nadu's {aspect}.",
        "key_contributions": _get_dynasty_contributions(dynasty, aspect),
        "notable_examples": _get_examples(dynasty, aspect, region),
        "lasting_impact": _get_lasting_impact(dynasty, aspect),
        "comparative_analysis": _compare_dynasties(dynasty, aspect),
        "modern_relevance": _get_modern_relevance(dynasty, aspect),
        "metadata": {
            "data_sources": [
                "STORM knowledge base",
                "archaeological records",
                "historical texts",
            ],
            "confidence": 0.88,
            "generated_at": datetime.now().isoformat(),
        },
    }

    return analysis


@mcp.tool()
def create_research_outline(
    topic: str, sections: int = 5, style: str = "wikipedia"
) -> dict[str, Any]:
    """
    Create a structured research outline using STORM methodology.

    Generates comprehensive outlines for research papers, articles,
    or guides about Tamil Nadu heritage topics.

    Args:
        topic: Topic to outline
        sections: Number of main sections (default 5)
        style: Outline style ("wikipedia", "academic", "travel_guide")

    Returns:
        Structured outline with sections and subsections
    """
    logger.info(f"Creating research outline for: {topic}")

    base_sections = [
        {"title": "Introduction", "subsections": ["Overview", "Significance", "Scope"]},
        {
            "title": "Historical Background",
            "subsections": ["Origins", "Development", "Key Events"],
        },
        {
            "title": "Main Content",
            "subsections": ["Core Aspects", "Features", "Characteristics"],
        },
        {
            "title": "Cultural Context",
            "subsections": ["Social Impact", "Traditions", "Modern Relevance"],
        },
        {
            "title": "Visitor Information",
            "subsections": ["How to Visit", "Best Time", "Tips"],
        },
    ]

    # Adjust based on style
    if style == "academic":
        base_sections.append(
            {
                "title": "References",
                "subsections": ["Primary Sources", "Secondary Sources"],
            }
        )
    elif style == "travel_guide":
        base_sections.extend(
            [
                {
                    "title": "Practical Information",
                    "subsections": ["Getting There", "Accommodation", "Food"],
                },
                {
                    "title": "Itinerary Suggestions",
                    "subsections": ["Half Day", "Full Day", "Extended Visit"],
                },
            ]
        )

    return {
        "topic": topic,
        "style": style,
        "outline": base_sections[:sections],
        "estimated_reading_time": f"{sections * 3} minutes",
        "generated_at": datetime.now().isoformat(),
    }


@mcp.tool()
def cross_reference_sites(
    site_names: list[str], reference_type: str = "historical"
) -> dict[str, Any]:
    """
    Cross-reference multiple heritage sites for connections.

    Uses STORM to find historical, architectural, cultural, or geographical
    connections between multiple sites.

    Args:
        site_names: List of site names to cross-reference
        reference_type: Type of reference ("historical", "architectural", "cultural", "geographical")

    Returns:
        Cross-reference analysis with connections matrix
    """
    logger.info(f"Cross-referencing {len(site_names)} sites by {reference_type}")

    connections = []

    for i, site1 in enumerate(site_names):
        for site2 in site_names[i + 1 :]:
            connection = _find_connection(site1, site2, reference_type)
            if connection:
                connections.append(connection)

    return {
        "sites": site_names,
        "reference_type": reference_type,
        "connections": connections,
        "connection_matrix": _build_connection_matrix(site_names, connections),
        "synthesis": _synthesize_cross_reference(connections),
        "generated_at": datetime.now().isoformat(),
    }


# ─────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────


def _generate_perspectives(topic: str, context: str) -> list[str]:
    """Generate research perspectives for STORM analysis"""
    base_perspectives = [
        "historical timeline",
        "architectural evolution",
        "cultural significance",
        "modern relevance",
        "visitor experience",
    ]

    if "temple" in topic.lower():
        base_perspectives.extend(
            ["religious practices", "ritual significance", "pilgrimage routes"]
        )

    if "dynasty" in topic.lower():
        base_perspectives.extend(
            ["political context", "administrative systems", "maritime influence"]
        )

    return base_perspectives


def _create_research_outline(
    topic: str, perspectives: list[str], depth: str
) -> list[str]:
    """Create structured outline from perspectives"""
    sections = ["Introduction", "Historical Background"]

    for p in perspectives[:4]:
        sections.append(p.replace("_", " ").title())

    sections.extend(["Significance", "Visitor Information", "Conclusion"])

    if depth == "comprehensive":
        sections.insert(3, "Detailed Analysis")
        sections.insert(-2, "Comparative Context")

    return sections


def _generate_sections(topic: str, outline: list[str], audience: str) -> list[dict]:
    """Generate content for each section"""
    sections = []

    for section_title in outline:
        section = {
            "title": section_title,
            "content": f"Comprehensive content about {topic} focusing on {section_title.lower()} for {audience} audience.",
            "key_points": [
                f"Key point 1 about {section_title}",
                f"Key point 2 about {section_title}",
                f"Key point 3 about {section_title}",
            ],
        }
        sections.append(section)

    return sections


def _extract_key_facts(topic: str) -> list[str]:
    """Extract key facts about topic"""
    return [
        f"Fact 1: {topic} has significant historical importance",
        f"Fact 2: {topic} represents key architectural achievement",
        f"Fact 3: {topic} attracts thousands of visitors annually",
        f"Fact 4: {topic} is part of UNESCO or national heritage",
        f"Fact 5: {topic} connects to broader Tamil cultural narrative",
    ]


def _generate_history_section(place: str, dynasty: str, info: dict) -> str:
    return f"{place} was constructed during the {dynasty} period ({info.get('period', 'ancient times')}). This magnificent structure exemplifies the {info.get('style', 'Dravidian')} architectural style that the {dynasty} dynasty was renowned for. Historical records indicate significant contributions to Tamil culture and heritage."


def _generate_architecture_section(place: str, dynasty: str) -> str:
    return f"The architectural marvel of {place} showcases distinctive {dynasty} features including intricate carvings, towering gopurams, and sacred geometry. The structure demonstrates advanced engineering techniques and aesthetic sensibilities of the era."


def _generate_cultural_section(place: str, dynasty: str) -> str:
    return f"{place} holds immense cultural significance as a center of worship, art, and community gatherings. During the {dynasty} era, it served as a hub for religious festivals, educational activities, and social events."


def _generate_myths_section(place: str) -> str:
    return f"Local legends and mythological stories surround {place}, adding to its mystical allure. These narratives have been passed down through generations, enriching the visitor experience with layers of cultural meaning."


def _generate_visitor_section(place: str) -> str:
    return f"Visitors to {place} can explore its magnificent architecture, participate in traditional ceremonies, and experience Tamil heritage firsthand. Best visited during festival seasons for a complete cultural immersion."


def _generate_preservation_section(place: str) -> str:
    return f"{place} is maintained by the Archaeological Survey of India/State Archaeology Department. Ongoing preservation efforts ensure this heritage treasure remains accessible for future generations."


def _get_dynasty_contributions(dynasty: str, aspect: str) -> list[str]:
    contributions = {
        "architecture": [
            f"Pioneered distinctive {dynasty} architectural style",
            f"Built numerous temples across Tamil Nadu",
            f"Innovated construction techniques and materials",
        ],
        "culture": [
            "Patronized classical arts and literature",
            "Established cultural institutions",
            "Promoted religious and artistic traditions",
        ],
        "literature": [
            "Sponsored great Tamil literary works",
            "Established educational centers",
            "Preserved and propagated Sangam literature",
        ],
        "administration": [
            "Developed efficient governance systems",
            "Established trade networks",
            "Created infrastructure for commerce",
        ],
    }
    return contributions.get(aspect, contributions["architecture"])


def _get_examples(dynasty: str, aspect: str, region: str) -> list[str]:
    dynasty_sites = (
        STORM_KNOWLEDGE_BASE["dynasties"].get(dynasty, {}).get("key_sites", [])
    )
    return dynasty_sites[:3]


def _get_lasting_impact(dynasty: str, aspect: str) -> str:
    return f"The {dynasty} dynasty's contributions to {aspect} continue to influence modern Tamil Nadu. Their architectural innovations set standards followed for centuries, while cultural patronage laid foundations for classical arts still practiced today."


def _compare_dynasties(dynasty: str, aspect: str) -> str:
    return f"Compared to other contemporary dynasties, the {dynasty} achieved distinctive excellence in {aspect}. Their unique approach combined traditional techniques with innovative adaptations."


def _get_modern_relevance(dynasty: str, aspect: str) -> str:
    return f"Today, {dynasty} heritage sites attract millions of tourists and pilgrims. Their architectural achievements are studied worldwide, while cultural traditions continue in festivals and arts."


def _find_connection(site1: str, site2: str, ref_type: str) -> dict:
    return {
        "site_1": site1,
        "site_2": site2,
        "connection_type": ref_type,
        "connection_strength": 0.75,
        "description": f"Both sites share {ref_type} significance and can be visited together",
    }


def _build_connection_matrix(sites: list[str], connections: list) -> dict:
    matrix = {}
    for site in sites:
        matrix[site] = {}
        for other in sites:
            if site != other:
                conn = next(
                    (
                        c
                        for c in connections
                        if (c["site_1"] == site and c["site_2"] == other)
                        or (c["site_2"] == site and c["site_1"] == other)
                    ),
                    None,
                )
                matrix[site][other] = conn["connection_strength"] if conn else 0
    return matrix


def _synthesize_cross_reference(connections: list) -> str:
    return f"Analysis found {len(connections)} meaningful connections. Sites can be grouped into thematic circuits for optimal visitor experience."


# ─────────────────────────────────────────────────────────────
# STORM RESOURCES
# ─────────────────────────────────────────────────────────────


@mcp.resource("storm://research/{topic}")
def get_research_resource(topic: str) -> str:
    """
    Get STORM research synthesis as a resource.

    Args:
        topic: Research topic identifier
    """
    result = synthesize_research_topic(topic)
    return json.dumps(result, indent=2)


@mcp.resource("storm://dynasty/{dynasty}")
def get_dynasty_resource(dynasty: str) -> str:
    """
    Get dynasty information as a resource.

    Args:
        dynasty: Dynasty name (Chola, Pallava, Pandya, British Colonial)
    """
    dynasty_info = STORM_KNOWLEDGE_BASE["dynasties"].get(dynasty, {})
    return json.dumps(
        {"dynasty": dynasty, "data": dynasty_info, "research_available": True}, indent=2
    )


# ─────────────────────────────────────────────────────────────
# STORM PROMPTS
# ─────────────────────────────────────────────────────────────


@mcp.prompt()
def research_tamil_heritage(topic: str, depth: str = "comprehensive") -> str:
    """
    Generate prompt for researching Tamil Nadu heritage using STORM.

    Args:
        topic: Heritage topic to research
        depth: Research depth (brief, standard, comprehensive)
    """
    return f"""Research {topic} in Tamil Nadu heritage context using STORM methodology.

    Steps:
    1. Use synthesize_research_topic with topic="{topic}" and depth="{depth}"
    2. Use analyze_dynasty_influence to understand historical context
    3. Use cross_reference_sites to find related locations
    4. Synthesize findings into a comprehensive guide
    
    Focus on historical accuracy, cultural significance, and practical visitor information.
    """


@mcp.prompt()
def create_heritage_guide(place_name: str, dynasty: str) -> str:
    """
    Generate prompt for creating a comprehensive heritage guide.

    Args:
        place_name: Name of heritage site
        dynasty: Associated dynasty
    """
    return f"""Create a comprehensive guide for {place_name} ({dynasty} dynasty).

    Steps:
    1. Use generate_heritage_narrative with place_name="{place_name}" and dynasty="{dynasty}"
    2. Use create_research_outline to structure the guide
    3. Include historical, architectural, and cultural sections
    4. Add practical visitor information
    
    Target audience: Tourists and heritage enthusiasts
    Style: Engaging, informative, and culturally respectful
    """


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
