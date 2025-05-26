import React from 'react';
import { Box, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ServicePoint } from '../types/models';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Исправляем проблему с иконками Leaflet в React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface ServicePointMapProps {
  points: ServicePoint[];
}

const ServicePointMap: React.FC<ServicePointMapProps> = ({ points }) => {
  // Находим центр карты на основе точек
  const center = React.useMemo(() => {
    if (points.length === 0) {
      return [55.7558, 37.6173]; // Москва по умолчанию
    }

    const validPoints = points.filter(p => p.latitude && p.longitude);
    if (validPoints.length === 0) {
      return [55.7558, 37.6173];
    }

    const sumLat = validPoints.reduce((sum, p) => sum + (p.latitude || 0), 0);
    const sumLng = validPoints.reduce((sum, p) => sum + (p.longitude || 0), 0);
    return [sumLat / validPoints.length, sumLng / validPoints.length];
  }, [points]);

  if (points.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Нет точек для отображения на карте
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <MapContainer
        center={center as [number, number]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map((point) => (
          point.latitude && point.longitude ? (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
            >
              <Popup>
                <Typography variant="subtitle2">{point.name}</Typography>
                <Typography variant="body2">{point.address}</Typography>
                {point.contact_phone && (
                  <Typography variant="body2">
                    Телефон: {point.contact_phone}
                  </Typography>
                )}
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </Box>
  );
};

export default ServicePointMap; 