import wikipedia
import requests
from bs4 import BeautifulSoup
import re
import urllib3
import logging

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

from typing import Dict, List, Optional

def fetch_district_gov_data(district_name: str) -> Optional[Dict]:
    """Scrapes structured data and descriptions from official TN district open-source websites (e.g. <district>.nic.in)."""
    district_clean = district_name.lower().replace(" ", "")
    
    # Known correct URL patterns per district
    if district_clean == "chennai":
        urls_to_try = [
            "https://chennai.nic.in/tourism/tourist-places/",
            "https://chennai.nic.in/tourism/places-of-interest/",
        ]
    else:
        urls_to_try = [
            f"https://{district_clean}.nic.in/tourist-places/",
            f"https://{district_clean}.nic.in/tourism/",
        ]
        
    all_text = []
    all_images = []
    
    for url in urls_to_try:
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            response = requests.get(url, headers=headers, timeout=10, verify=False)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                # The core content is often inside entry-content or page-content
                content_div = (
                    soup.find('div', class_='entry-content') or
                    soup.find('div', id='content') or
                    soup.find('div', class_='page-content') or
                    soup.find('main') or
                    soup.find('article')
                )
                
                if content_div:
                    text = content_div.get_text(separator='\n', strip=True)
                    all_text.append(text)
                    
                    for img in content_div.find_all('img'):
                        src = img.get('src')
                        if src:
                            if src.startswith('/'):
                                domain = url.split('/')[2]
                                src = f"https://{domain}{src}"
                            all_images.append(src)
        except Exception as e:
            logger.warning(f"Error fetching district govt data for {district_name} at {url}: {e}")
    
    if all_text:
        return {
            "source": urls_to_try[0],
            "content": "\n\n".join(all_text),
            "images": list(set(all_images))
        }
    
    return None

def fetch_place_history(place_name: str) -> Optional[Dict]:
    """Uses the wikipedia package and web scraping as fallback to pull historical significance."""
    try:
        results = wikipedia.search(place_name + " Tamil Nadu India")
        if not results:
            return None
            
        page = wikipedia.page(results[0], auto_suggest=False)
        
        # We try to extract only relevant images (.jpg, .png) that aren't icons
        images = []
        for img in page.images:
            img_lower = img.lower()
            if img_lower.endswith(('.png', '.jpg', '.jpeg', '.webp')):
                if 'icon' not in img_lower and 'logo' not in img_lower:
                    images.append(img)
                    
        return {
            "title": page.title,
            "summary": page.summary,
            "full_content": page.content,
            "images": images,
            "source": page.url
        }
    except wikipedia.exceptions.DisambiguationError as e:
        logger.warning(f"Wikipedia Disambiguation for {place_name}: {e.options}")
    except Exception as e:
        logger.warning(f"Error fetching wikipedia for {place_name}: {e}")
        
    return None

def get_rich_place_data(place_name: str, district_name: Optional[str] = None) -> Dict:
    """Combines district govt data and wikipedia data to formulate the richest history and image set."""
    historical_significance = ""
    images = []
    sources = []
    
    # Try Wiki
    wiki_data = fetch_place_history(place_name)
    if wiki_data:
        historical_significance += f"Overview:\n{wiki_data['summary']}\n\nDetailed History:\n{wiki_data['full_content']}\n"
        images.extend(wiki_data['images'])
        sources.append(wiki_data['source'])
        
    # Try District
    if district_name:
        gov_data = fetch_district_gov_data(district_name)
        if gov_data and place_name.lower() in gov_data['content'].lower():
            historical_significance += f"\n\nOfficial Government District Data:\n"
            # Extract just a snippet around the place name if possible, or append it
            # To keep it simple, append everything if place name present
            historical_significance += gov_data['content']
            images.extend(gov_data['images'])
            sources.append(gov_data['source'])
            
    # Deduplicate images
    unique_images = list(set(images))
    
    return {
        "historical_significance": historical_significance.strip(),
        "images": unique_images,
        "sources": sources
    }
