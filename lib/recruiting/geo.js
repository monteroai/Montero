import { geoContains, geoCentroid } from 'd3-geo'
import { feature } from 'topojson-client'
import us from 'us-atlas/states-10m.json'

// Server-side check on the coordinates the model returns: a pin must sit inside its own state,
// otherwise it moves to the state's centre. Keeps a wrong guess from putting Newark in Ohio.
const BY_NAME = Object.fromEntries(feature(us, us.objects.states).features.map((f) => [f.properties.name, f]))

/** @param {string} stateName @param {number} lon @param {number} lat @returns {[number, number]} */
export function pinIn(stateName, lon, lat) {
  const f = BY_NAME[stateName]
  if (!f) return [lon, lat]
  if (isFinite(lon) && isFinite(lat) && geoContains(f, [lon, lat])) return [lon, lat]
  const c = geoCentroid(f)
  return [+c[0].toFixed(3), +c[1].toFixed(3)]
}
