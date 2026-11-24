"use client";
import { useEffect, useRef, useState } from "react";

export default function TelanganaMap({ onDistrictClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [districtInfo, setDistrictInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css").catch(() => {});
      // leaflet css loaded via dynamic import

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        preferCanvas: false,
        minZoom: 6,
        maxZoom: 12,
        maxBounds: [[15.0, 76.5], [20.0, 81.5]],
        maxBoundsViscosity: 1.0,
      }).setView([17.5, 79.0], 7);
      mapInstanceRef.current = map;

      // Force size recalculation after mount
      setTimeout(() => map.invalidateSize(), 200);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      fetch("/geojson/telangana.geojson")
        .then((r) => r.json())
        .then((geoData) => {
          if (!mapInstanceRef.current) return;

          const geoLayer = L.geoJSON(geoData, {
            style: {
              color: "#1d4ed8",
              weight: 1.5,
              fillColor: "#bfdbfe",
              fillOpacity: 0.5,
            },
            onEachFeature: (feature, layer) => {
              const name = feature.properties.NAME_1;

              // Show district name as permanent tooltip
              layer.bindTooltip(name, {
                permanent: true,
                direction: "center",
                className: "district-label",
              });

              layer.on("click", async () => {
                if (!mapInstanceRef.current) return;

                // Highlight clicked
                geoLayer.resetStyle();
                layer.setStyle({ fillColor: "#3b82f6", fillOpacity: 0.8, weight: 2.5 });

                setDistrictInfo({ name, loading: true, petitions: null, works: null });
                setLoadingInfo(true);

                try {
                  const res = await fetch(`/api/district-data?name=${encodeURIComponent(name)}`);
                  if (res.ok) {
                    const data = await res.json();
                    setDistrictInfo({
                      name,
                      loading: false,
                      petitions: data.grievances ?? 0,
                      works: data.projects ?? 0,
                      pending: data.pending ?? 0,
                      completed: data.completed ?? 0,
                    });
                  } else {
                    setDistrictInfo({ name, loading: false, petitions: 0, works: 0, pending: 0, completed: 0 });
                  }
                } catch {
                  setDistrictInfo({ name, loading: false, petitions: 0, works: 0, pending: 0, completed: 0 });
                } finally {
                  setLoadingInfo(false);
                }

                if (onDistrictClick) onDistrictClick(name);
              });

              layer.on("mouseover", () => {
                if (layer.options.fillColor !== "#3b82f6") {
                  layer.setStyle({ fillColor: "#93c5fd", fillOpacity: 0.7, weight: 2 });
                }
              });
              layer.on("mouseout", () => {
                if (layer.options.fillColor !== "#3b82f6") {
                  layer.setStyle({ fillColor: "#bfdbfe", fillOpacity: 0.5, weight: 1.5 });
                }
              });
            },
          }).addTo(map);

          map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] });
        })
        .catch((err) => console.error("GeoJSON error:", err));
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <style>{`
        .district-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          color: #1e3a8a !important;
          white-space: nowrap !important;
        }
      `}</style>

      <div ref={mapRef} style={{ height: "480px", width: "100%", borderRadius: "8px", zIndex: 0, display: "block" }} />

      {/* District Info Panel */}
      {districtInfo && (
        <div className="mt-3 p-4 bg-white border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-900 text-base">{districtInfo.name} District</h3>
            <button
              onClick={() => setDistrictInfo(null)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              ✕ Close
            </button>
          </div>
          {districtInfo.loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading district data...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{districtInfo.petitions}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Total Petitions</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{districtInfo.works}</p>
                <p className="text-xs text-indigo-600 font-medium mt-1">Public Works</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{districtInfo.pending}</p>
                <p className="text-xs text-amber-600 font-medium mt-1">Pending</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{districtInfo.completed}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Completed</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
