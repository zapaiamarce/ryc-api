export const foodToIndex = ({
  id,
  addressstr,
  title,
  dates,
  cook
}) => ({
  objectID: id,
  addressstr,
  title,
  dates,
  _geoloc: cook && cook.deliveryCenterLocation
})