import axios from 'axios';

export function fetchSatellites(objectTypes, attributes = []) {
  const params = {
    attributes: Array.isArray(attributes) ? attributes.join(',') : ''
  };

  if (Array.isArray(objectTypes) && objectTypes.length) {
    params.objectTypes = objectTypes.join(',');
  }

  return axios.get('/api/satellites', { params });
}
