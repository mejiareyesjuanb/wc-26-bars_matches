// Curated nightlife/bar neighborhood NAME lists per city (the source of truth a
// build script geocodes into centroids — see scripts/build-city-neighborhoods.mjs).
// Names are researched canonical neighborhoods; COORDINATES are Google-sourced
// (geocoded), never hand-typed. Seattle is NOT here — it keeps its existing inline
// centroids in cities.js. New York is two-level (grouped by borough).
//
// To change a city's neighborhoods: edit the list, re-run the build script, commit
// the regenerated src/data/cityCentroids.js.

export const CITY_NEIGHBORHOODS = {
  'los-angeles': {
    city: 'Los Angeles',
    region: 'CA',
    neighborhoods: [
      'Downtown Los Angeles', 'Hollywood', 'West Hollywood', 'Santa Monica', 'Venice',
      'Silver Lake', 'Echo Park', 'Los Feliz', 'Koreatown', 'Highland Park',
      'Culver City', 'Pasadena', 'Studio City', 'Long Beach',
    ],
  },
  chicago: {
    city: 'Chicago',
    region: 'IL',
    neighborhoods: [
      'River North', 'Wicker Park', 'Logan Square', 'Lakeview', 'Wrigleyville',
      'Lincoln Park', 'West Loop', 'Gold Coast', 'Old Town', 'Bucktown',
      'Fulton Market', 'Andersonville', 'Pilsen', 'The Loop',
    ],
  },
  denver: {
    city: 'Denver',
    region: 'CO',
    neighborhoods: [
      'LoDo', 'RiNo', 'Capitol Hill', 'LoHi', 'Five Points', 'Baker',
      'Cherry Creek', 'Washington Park', 'Berkeley', 'Uptown',
    ],
  },
  austin: {
    city: 'Austin',
    region: 'TX',
    neighborhoods: [
      'Downtown', 'Rainey Street', 'Sixth Street', 'West Sixth', 'East Austin',
      'South Congress', 'Red River', 'North Loop', 'The Domain', 'Clarksville',
    ],
  },
  'washington-dc': {
    city: 'Washington',
    region: 'DC',
    neighborhoods: [
      'Georgetown', 'Dupont Circle', 'Adams Morgan', 'U Street Corridor', 'Shaw',
      'Logan Circle', 'H Street NE', 'Capitol Hill', 'Navy Yard', 'Columbia Heights',
      'Penn Quarter', 'Foggy Bottom',
    ],
  },
  miami: {
    city: 'Miami',
    region: 'FL',
    neighborhoods: [
      'South Beach', 'Wynwood', 'Brickell', 'Downtown Miami', 'Little Havana',
      'Coconut Grove', 'Coral Gables', 'Design District', 'Midtown', 'North Beach',
    ],
  },
  portland: {
    city: 'Portland',
    region: 'OR',
    neighborhoods: [
      'Pearl District', 'Downtown', 'Old Town Chinatown', 'Hawthorne', 'Division',
      'Alberta Arts District', 'Mississippi Avenue', 'Nob Hill', 'Belmont', 'Slabtown',
    ],
  },
  'san-francisco': {
    city: 'San Francisco',
    region: 'CA',
    neighborhoods: [
      'Mission District', 'SoMa', 'North Beach', 'Marina District', 'Hayes Valley',
      'Castro', 'Haight-Ashbury', 'Polk Gulch', 'Tenderloin', 'Dogpatch',
    ],
  },
  boston: {
    city: 'Boston',
    region: 'MA',
    neighborhoods: [
      'Downtown', 'Beacon Hill', 'Back Bay', 'North End', 'South End', 'Fenway',
      'Seaport', 'South Boston', 'Charlestown', 'Jamaica Plain', 'Allston',
      'Harvard Square', 'Central Square', 'Kendall Square', 'Davis Square',
    ],
  },
  // Two-level (borough → neighborhood). Geocoded as "{neighborhood}, {borough}, New York, NY".
  'new-york': {
    city: 'New York',
    region: 'NY',
    boroughs: {
      Manhattan: [
        'East Village', 'West Village', 'Lower East Side', 'Greenwich Village', 'Chelsea',
        "Hell's Kitchen", 'Midtown', 'Murray Hill', 'Upper East Side', 'Upper West Side',
        'Financial District', 'Harlem',
      ],
      Brooklyn: [
        'Williamsburg', 'Bushwick', 'Park Slope', 'Greenpoint', 'Brooklyn Heights',
        'DUMBO', 'Bedford-Stuyvesant', 'Crown Heights', 'Gowanus', 'Cobble Hill',
      ],
      Queens: ['Astoria', 'Long Island City', 'Flushing', 'Jackson Heights', 'Forest Hills'],
      'The Bronx': ['Mott Haven', 'Fordham', 'Riverdale'],
      'Staten Island': ['St. George', 'New Dorp'],
    },
  },
}
