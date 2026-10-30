"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { CampusLocation } from "@/types";

export default function CampusMap({
  locations,
}: {
  locations: CampusLocation[];
}) {
  const points = locations.filter(
    (location) =>
      location.latitude !== null && location.longitude !== null,
  );

  const center: [number, number] =
    points.length > 0
      ? [Number(points[0].latitude), Number(points[0].longitude)]
      : [-6.9175, 107.6191];

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={false}
      className="h-[520px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((location) => (
        <CircleMarker
          key={location.id}
          center={[Number(location.latitude), Number(location.longitude)]}
          radius={10}
          pathOptions={{
            color: "#14654a",
            weight: 2,
            fillColor: "#14654a",
            fillOpacity: 0.75,
          }}
        >
          <Popup>
            <strong>{location.name}</strong>
            {location.building ? (
              <>
                <br />
                {location.building}
              </>
            ) : null}
            {location.description ? (
              <>
                <br />
                {location.description}
              </>
            ) : null}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
