/**
 * Curated science sources for mission facts and future gameplay systems.
 * This registry is metadata only: it does not fetch live data or require a key.
 */
export const SCIENCE_SOURCES = Object.freeze({
  viking2: {
    id: 'viking-2-utopia-planitia',
    organization: 'NASA',
    title: 'Viking 2 mission and landing site',
    url: 'https://science.nasa.gov/mission/viking-2/',
    missionUse: 'Source for the Utopia Planitia place name and Viking 2 landing story.',
    boundary: 'Coordinates depend on the stated Mars latitude convention; the landing display uses planetocentric coordinates.',
  },
  terrainNavigation: {
    id: 'nasa-terrain-relative-navigation',
    organization: 'NASA',
    title: 'Terrain Relative Navigation: Landing Between the Hazards',
    url: 'https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/terrain-relative-navigation-landing-between-the-hazards/',
    missionUse: 'Explains how Perseverance compared camera images to a stored terrain map to avoid hazards during landing.',
    boundary: 'This game’s crew surface survey is fictional; Perseverance used this technology during robotic landing, not a crewed surface walk.',
  },
  nasaOpenApis: {
    id: 'nasa-open-apis',
    organization: 'NASA',
    title: 'NASA Open APIs',
    url: 'https://api.nasa.gov/',
    missionUse: 'Astronomy imagery and Mars rover photo references for mission briefings and story moments.',
    boundary: 'Use a backend proxy for API keys and rate limits; label image dates and rover/camera metadata.',
  },
  donki: {
    id: 'donki',
    organization: 'NASA CCMC',
    title: 'Space Weather Database (DONKI)',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    apiDocsUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/api/',
    missionUse: 'Space-weather event context for authored solar-storm and communications mission events.',
    boundary: 'NASA describes DONKI as prototyping-quality research information. Use it as scenario context, not a crew-specific dose forecast.',
  },
  osdr: {
    id: 'osdr',
    organization: 'NASA',
    title: 'Open Science Data Repository (OSDR)',
    url: 'https://osdr.nasa.gov/bio/repo/',
    searchApiUrl: 'https://osdr.nasa.gov/osdr/data/search?term=KEYWORD',
    missionUse: 'Find published space-biology studies to inform age-appropriate crew-health learning moments.',
    boundary: 'Explain the study and its limits; do not turn research findings into personal medical predictions.',
  },
  radlab: {
    id: 'radlab',
    organization: 'NASA OSDR',
    title: 'RadLab Radiation Dosimetry Database',
    url: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
    apiUrl: 'https://visualization.osdr.nasa.gov/radlab/api',
    missionUse: 'Show how measured radiation dose rates vary across spaceflight settings and instruments.',
    boundary: 'ISS/spaceflight dosimetry is a comparison for learning, not a direct measurement of conditions at a Mars outpost.',
  },
  marsTrek: {
    id: 'mars-trek',
    organization: 'NASA',
    title: 'Mars Trek',
    url: 'https://trek.nasa.gov/mars/',
    missionUse: 'Ground landing-area maps, terrain, and elevation choices in real Mars data.',
    boundary: 'Keep source imagery and derived terrain layers attributed and distinguish them from game-built scenery.',
  },
  csaFood: {
    id: 'csa-food-production',
    organization: 'Canadian Space Agency',
    title: 'Food Production on the Moon and in Remote Areas',
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
    missionUse: 'Child-friendly farming, nutrition, and food-system activities to shape greenhouse gameplay.',
    boundary: 'Use as educational inspiration and cite the CSA resource; do not present activities as flight-qualified procedures.',
  },
  csaYouth: {
    id: 'csa-youth-stem',
    organization: 'Canadian Space Agency',
    title: 'Space Resources for STEM and Youth Organizations',
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp',
    missionUse: 'Age-appropriate activities and educator-tested ways to explain mission science.',
    boundary: 'Adapt learning activities with attribution and keep the game’s own fictional scenario clear.',
  },
});

export const SOURCE_GUARDRAILS = Object.freeze([
  'Keep NASA or CSA observations separate from derived values and fictional mission numbers.',
  'Show the source, observation date, units, and any important data limitation alongside science-based gameplay.',
  'Never imply that a research archive or prototype-quality feed is an operational safety forecast.',
]);
