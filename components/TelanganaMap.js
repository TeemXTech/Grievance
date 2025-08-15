"use client";
import { useEffect, useRef } from "react";

export default function TelanganaMap({ onDistrictClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Prevent duplicate map

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix default markers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      if (!mapRef.current) return;
      
      // Initialize map
      const map = L.map(mapRef.current).setView([17.9784, 79.5941], 7);
      mapInstanceRef.current = map;

      // Add free OpenStreetMap layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      // Load Telangana boundaries
      fetch("/geojson/telangana.geojson")
        .then((res) => res.json())
        .then((geoData) => {
          L.geoJSON(geoData, {
            style: {
              color: "#2563eb",
              weight: 2,
              fillColor: "#dbeafe",
              fillOpacity: 0.6
            },
            onEachFeature: (feature, layer) => {
              const districtName = feature.properties.NAME_1;
              
              layer.on("click", async () => {
                // Zoom to district
                map.fitBounds(layer.getBounds());
                
                // Highlight selected district
                layer.setStyle({ 
                  fillColor: "#3b82f6", 
                  fillOpacity: 0.8 
                });
                
                // Reset other districts
                map.eachLayer((l) => {
                  if (l.feature && l !== layer) {
                    l.setStyle({ 
                      fillColor: "#dbeafe", 
                      fillOpacity: 0.6 
                    });
                  }
                });

                let popupContent = `<b>${districtName}</b><br>Loading data...`;
                layer.bindPopup(popupContent).openPopup();

                try {
                  const res = await fetch(
                    `/api/district-data?name=${encodeURIComponent(districtName)}`
                  );
                  if (res.ok) {
                    const data = await res.json();
                    popupContent = `
                      <div style="font-family: system-ui; padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; color: #1f2937;">${districtName}</h3>
                        <div style="display: flex; gap: 16px;">
                          <div>
                            <div style="color: #3b82f6; font-weight: 600;">Projects: ${data.projects}</div>
                            <div style="color: #ef4444; font-weight: 600;">Grievances: ${data.grievances}</div>
                          </div>
                          <div>
                            <div style="color: #10b981; font-size: 12px;">Completed: ${data.completed || 0}</div>
                            <div style="color: #f59e0b; font-size: 12px;">Pending: ${data.pending || 0}</div>
                          </div>
                        </div>
                      </div>
                    `;
                  } else {
                    popupContent = `
                      <div style="font-family: system-ui; padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; color: #1f2937;">${districtName}</h3>
                        <div style="color: #6b7280;">No data available</div>
                      </div>
                    `;
                  }
                } catch {
                  popupContent = `
                    <div style="font-family: system-ui; padding: 8px;">
                      <h3 style="margin: 0 0 8px 0; color: #1f2937;">${districtName}</h3>
                      <div style="color: #ef4444;">Error loading data</div>
                    </div>
                  `;
                }

                layer.bindPopup(popupContent).openPopup();
                
                // Callback to parent component
                if (onDistrictClick) {
                  onDistrictClick(districtName);
                }
              });

              // Hover effects
              layer.on("mouseover", () => {
                layer.setStyle({ 
                  weight: 3,
                  fillOpacity: 0.8 
                });
              });

              layer.on("mouseout", () => {
                layer.setStyle({ 
                  weight: 2,
                  fillOpacity: 0.6 
                });
              });
            }
          }).addTo(map);
        })
        .catch((error) => {
          console.error("Error loading GeoJSON:", error);
        });
    };
    
    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onDistrictClick]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: "500px", 
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e5e7eb"
      }}
    />
  );
}