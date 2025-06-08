import axios from 'axios';

export function fetchSatellites(objectTypes = [], attributes = []) {
  const params = {
    objectTypes: objectTypes.join(','),
    attributes: attributes.join(',')
  };

  // Use the proxy route
  return axios.get(`/api/satellites`, { params });
}
