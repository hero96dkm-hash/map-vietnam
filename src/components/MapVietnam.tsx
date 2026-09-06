import React, { useState, useRef, useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Province as ProvinceType, ProvinceStatus } from '../types/game';
import { Province } from './Province';
import { useGameLogic } from '../hooks/useGameLogic';
import geoDataRaw from '../data/vietnamProvinces.json';
import mergedGeoDataRaw from '../data/mergedProvinces.json';
import { soundManager } from '../utils/soundEffects';
import { ZoomIn, ZoomOut, RotateCcw, Compass, MapPin } from 'lucide-react';

const geoData = geoDataRaw as unknown as FeatureCollection<
  Geometry,
  { OBJECTID: number; Ma: string; Ten: string; Cap: string; Name: string }
>;

interface MergedFeatureProperties {
  groupId: string;
  newProvince: string;
  description: string;
  region: string;
  provinces: string[];
  color: string;
}

const mergedGeoData = mergedGeoDataRaw as unknown as FeatureCollection<
  Geometry,
  MergedFeatureProperties
>;

export const MapVietnam: React.FC = () => {
  const {
    currentLevel,
    provinces,
    selectedProvinceIds,
    completedGroupIds,
    groups,
    checkResult,
    toggleProvince,
    level1FoundIds,
    level1Feedback,
  } = useGameLogic();

  // Hover state for tooltip
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceType | null>(null);
  const [hoveredMerged, setHoveredMerged] = useState<{
    groupId: string;
    newProvince: string;
    description: string;
    region: string;
    provinces: string[];
    color: string;
    pathData: string;
    visualCentroid: [number, number];
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Pan & Zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Setup d3 projection fitted to 1000x1000 viewport
  const projection = useMemo(() => {
    const proj = geoMercator();
    // Fit the 63 provinces (including Paracel & Spratly archipelagos) into 1000x1000 viewBox with padding
    proj.fitExtent(
      [
        [35, 35],
        [965, 965],
      ],
      geoData
    );
    return proj;
  }, []);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  // Compute SVG path and visual centroid for each of the 63 provinces
  const provincesWithGeo = useMemo(() => {
    return provinces.map((province) => {
      const feature =
        (province.featureIndex !== undefined ? geoData.features[province.featureIndex] : undefined) ||
        geoData.features.find((f) => f.properties.Ma === province.code);

      let pathData = '';
      let visualCentroid: [number, number] = [0, 0];

      if (feature) {
        pathData = pathGen(feature) || '';

        // For visual label centroid: if MultiPolygon, pick mainland/largest polygon
        if (feature.geometry.type === 'Polygon') {
          visualCentroid = pathGen.centroid(feature);
        } else if (feature.geometry.type === 'MultiPolygon') {
          let maxLen = 0;
          let mainCoords = feature.geometry.coordinates[0];
          feature.geometry.coordinates.forEach((poly) => {
            if (poly[0].length > maxLen) {
              maxLen = poly[0].length;
              mainCoords = poly;
            }
          });
          visualCentroid = pathGen.centroid({
            type: 'Feature',
            properties: feature.properties,
            geometry: { type: 'Polygon', coordinates: mainCoords },
          });
        }
      }

      return {
        ...province,
        pathData,
        visualCentroid,
      };
    });
  }, [provinces, pathGen]);

  // Compute SVG path and visual centroid for each of the 23 merged province groups
  const mergedProvincesWithGeo = useMemo(() => {
    return mergedGeoData.features.map((feature) => {
      const pathData = pathGen(feature) || '';
      let visualCentroid: [number, number] = [0, 0];

      if (feature.geometry.type === 'Polygon') {
        visualCentroid = pathGen.centroid(feature);
      } else if (feature.geometry.type === 'MultiPolygon') {
        let maxLen = 0;
        let mainCoords = feature.geometry.coordinates[0];
        feature.geometry.coordinates.forEach((poly) => {
          if (poly[0].length > maxLen) {
            maxLen = poly[0].length;
            mainCoords = poly;
          }
        });
        visualCentroid = pathGen.centroid({
          type: 'Feature',
          properties: feature.properties,
          geometry: { type: 'Polygon', coordinates: mainCoords },
        });
      }

      return {
        ...feature.properties,
        pathData,
        visualCentroid,
      };
    });
  }, [pathGen]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.3, 4.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.3, 0.7));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.7), 4.0));
  };

  const handleHover = (province: ProvinceType | null) => {
    setHoveredProvince(province);
  };

  const handleSelectProvince = (id: number) => {
    toggleProvince(id);
  };

  // Color map for completed groups
  const completedGroupColorMap: Record<string, string> = {};
  groups.forEach((g) => {
    completedGroupColorMap[g.groupId] = g.color;
  });

  return (
    <div
      ref={containerRef}
      id="vietnam-map-container"
      className="relative w-full h-[620px] lg:h-[720px] bg-gradient-to-b from-sky-100/70 via-blue-50/50 to-emerald-50/50 rounded-3xl border-4 border-white/80 shadow-xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Sea Watermark */}
      <div className="absolute top-1/3 right-16 text-sky-300/40 text-4xl lg:text-5xl font-black tracking-widest pointer-events-none select-none">
        BIỂN ĐÔNG
      </div>

      {/* Floating Map Controls - Larger touch targets for kids */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 bg-white/95 backdrop-blur-md p-2.5 rounded-3xl shadow-lg border border-slate-200/80">
        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          title="Phóng to bản đồ"
          className="p-3 rounded-2xl text-slate-700 hover:text-edu-blue hover:bg-blue-50 transition-colors cursor-pointer active:scale-95"
        >
          <ZoomIn size={22} />
        </button>
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          title="Thu nhỏ bản đồ"
          className="p-3 rounded-2xl text-slate-700 hover:text-edu-blue hover:bg-blue-50 transition-colors cursor-pointer active:scale-95"
        >
          <ZoomOut size={22} />
        </button>
        <button
          id="btn-zoom-reset"
          onClick={handleReset}
          title="Đặt lại vị trí ban đầu"
          className="p-3 rounded-2xl text-slate-700 hover:text-edu-blue hover:bg-blue-50 transition-colors cursor-pointer active:scale-95"
        >
          <RotateCcw size={22} />
        </button>
      </div>

      {/* Compass Indicator */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md text-xs sm:text-sm font-black text-slate-700 border border-slate-200 pointer-events-none">
        <Compass size={20} className="text-edu-blue animate-spin-slow" />
        <span>HƯỚNG BẮC</span>
      </div>

      {/* Map Status Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-3xl shadow-md border border-slate-200 text-xs sm:text-sm hidden sm:block pointer-events-none">
        <div className="font-black text-slate-800 mb-2">
          {currentLevel === 1 ? 'Màu sắc (Cấp độ 1: Nhận biết):' : 'Màu sắc các tỉnh (Quy hoạch 2025):'}
        </div>
        {currentLevel === 1 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-400"></span>
              <span className="text-slate-600 font-semibold">Chưa tìm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600"></span>
              <span className="text-slate-800 font-black">Đã nhận biết</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-400"></span>
              <span className="text-slate-600 font-semibold">Tỉnh cũ chưa gộp</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-edu-blue border border-blue-700"></span>
              <span className="text-slate-800 font-black">Đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600"></span>
              <span className="text-slate-800 font-black">Tỉnh mới (Đã gộp)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-600"></span>
              <span className="text-slate-800 font-black">Chọn sai</span>
            </div>
          </div>
        )}
      </div>

      {/* Main SVG Map - Auto-scales to screen via responsive viewBox & preserveAspectRatio */}
      <svg
        id="vietnam-svg-map"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="2" dy="5" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* 63 Provinces Layer from GeoJSON */}
        <g id="vietnam-provinces-layer" filter="url(#map-shadow)">
          {provincesWithGeo
            .filter((province) => {
              // In Level 2 & Level 3: Once a group is merged correctly, its old provinces disappear!
              if (currentLevel !== 1 && completedGroupIds.includes(province.groupId)) {
                return false;
              }
              return true;
            })
            .map((province) => {
              let status: ProvinceStatus = 'default';
              let isCompleted = false;

              if (currentLevel === 1) {
                if (level1FoundIds.includes(province.id)) {
                  status = 'correct';
                  isCompleted = true;
                } else if (level1Feedback && level1Feedback.provinceName === province.oldProvince) {
                  status = level1Feedback.isCorrect ? 'correct' : 'wrong';
                }
              } else {
                const isSelected = selectedProvinceIds.includes(province.id);
                if (isSelected) {
                  if (checkResult && !checkResult.isCorrect) {
                    status = 'wrong';
                  } else {
                    status = 'selected';
                  }
                }
              }

              return (
                <Province
                  key={province.id}
                  province={province}
                  pathData={province.pathData}
                  status={status}
                  isCompleted={isCompleted}
                  completedColor={completedGroupColorMap[province.groupId]}
                  onSelect={handleSelectProvince}
                  onHover={(p) => {
                    setHoveredMerged(null);
                    handleHover(p);
                  }}
                />
              );
            })}
        </g>

        {/* NEW MERGED PROVINCES Layer: Appears when merged correctly in Level 2 & 3 */}
        {currentLevel !== 1 && (
          <g id="vietnam-merged-provinces-layer" filter="url(#map-shadow)">
            {mergedProvincesWithGeo
              .filter((merged) => completedGroupIds.includes(merged.groupId))
              .map((merged) => (
                <g
                  key={`merged-${merged.groupId}`}
                  id={`merged-group-${merged.groupId}`}
                  onClick={() => soundManager.playSuccess()}
                  onMouseEnter={() => {
                    setHoveredProvince(null);
                    setHoveredMerged(merged);
                  }}
                  onMouseLeave={() => setHoveredMerged(null)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <path
                    d={merged.pathData}
                    fill={merged.color}
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="province-merged-path province-correct-glow cursor-pointer transition-transform duration-200 hover:brightness-110"
                  />
                </g>
              ))}
          </g>
        )}

        {/* Province Name Labels (clickable and hoverable) */}
        <g id="province-labels-layer">
          {provincesWithGeo
            .filter((province) => {
              // In Level 2 & Level 3: Hide old labels for completed groups!
              if (currentLevel !== 1 && completedGroupIds.includes(province.groupId)) {
                return false;
              }
              return true;
            })
            .map((province) => {
              const isSelected = selectedProvinceIds.includes(province.id);
              const isHighlighted =
                currentLevel === 1
                  ? level1FoundIds.includes(province.id)
                  : isSelected;
              const [cx, cy] = province.visualCentroid;

              if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;

              return (
                <text
                  key={`label-${province.id}`}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isHighlighted ? '5.2' : '4.2'}
                  fontWeight={isHighlighted ? '900' : '700'}
                  fill={isHighlighted ? (selectedProvinceIds.includes(province.id) ? '#ffffff' : '#78350f') : '#0f172a'}
                  stroke={selectedProvinceIds.includes(province.id) ? '#1e3a8a' : '#ffffff'}
                  strokeWidth={isHighlighted ? '0.9' : '0.65'}
                  paintOrder="stroke"
                  fontFamily="Nunito, sans-serif"
                  onClick={() => handleSelectProvince(province.id)}
                  onMouseEnter={() => {
                    setHoveredMerged(null);
                    handleHover(province);
                  }}
                  onMouseLeave={() => handleHover(null)}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  className="cursor-pointer select-none transition-transform hover:scale-110"
                >
                  {province.oldProvince}
                </text>
              );
            })}
        </g>

        {/* New Merged Province Name Labels */}
        {currentLevel !== 1 && (
          <g id="merged-province-labels-layer">
            {mergedProvincesWithGeo
              .filter((merged) => completedGroupIds.includes(merged.groupId))
              .map((merged) => {
                const [cx, cy] = merged.visualCentroid;
                if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;

                return (
                  <g
                    key={`merged-label-${merged.groupId}`}
                    onClick={() => soundManager.playSuccess()}
                    onMouseEnter={() => {
                      setHoveredProvince(null);
                      setHoveredMerged(merged);
                    }}
                    onMouseLeave={() => setHoveredMerged(null)}
                    className="cursor-pointer select-none"
                  >
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="6.2"
                      fontWeight="900"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1.4"
                      paintOrder="stroke"
                      fontFamily="Nunito, sans-serif"
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                      className="cursor-pointer select-none transition-transform hover:scale-110 font-black tracking-wide"
                    >
                      {merged.newProvince}
                    </text>
                  </g>
                );
              })}
          </g>
        )}

        {/* Quần đảo Hoàng Sa (Việt Nam) Badge */}
        <g id="hoang-sa-islands-badge" className="cursor-pointer">
          <rect
            x="540"
            y="370"
            width="170"
            height="55"
            rx="10"
            fill="#ffffff"
            fillOpacity="0.9"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text
            x="625"
            y="393"
            textAnchor="middle"
            fill="#0369a1"
            fontSize="10.5"
            fontWeight="bold"
            fontFamily="Nunito, sans-serif"
          >
            Quần đảo Hoàng Sa
          </text>
          <text
            x="625"
            y="410"
            textAnchor="middle"
            fill="#ef4444"
            fontSize="9"
            fontWeight="bold"
            fontFamily="Nunito, sans-serif"
          >
            (TP. Đà Nẵng, Việt Nam)
          </text>
        </g>

        {/* Quần đảo Trường Sa (Việt Nam) Badge */}
        <g id="truong-sa-islands-badge" className="cursor-pointer">
          <rect
            x="660"
            y="720"
            width="180"
            height="55"
            rx="10"
            fill="#ffffff"
            fillOpacity="0.9"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text
            x="750"
            y="743"
            textAnchor="middle"
            fill="#0369a1"
            fontSize="10.5"
            fontWeight="bold"
            fontFamily="Nunito, sans-serif"
          >
            Quần đảo Trường Sa
          </text>
          <text
            x="750"
            y="760"
            textAnchor="middle"
            fill="#ef4444"
            fontSize="9"
            fontWeight="bold"
            fontFamily="Nunito, sans-serif"
          >
            (Khánh Hòa, Việt Nam)
          </text>
        </g>
      </svg>

      {/* Floating Tooltip for Old Province */}
      {hoveredProvince && !hoveredMerged && (
        <div
          id="map-tooltip"
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 text-xs sm:text-sm min-w-[170px] text-center animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="flex items-center justify-center gap-1.5 font-black text-base text-edu-yellow-light">
            <MapPin size={16} className="text-red-400" />
            <span>{hoveredProvince.oldProvince}</span>
          </div>
          <div className="text-slate-200 text-xs font-semibold mt-0.5">{hoveredProvince.region}</div>
          {hoveredProvince.capital && (
            <div className="text-slate-300 text-xs mt-1 border-t border-slate-700/60 pt-1">
              Trung tâm: <strong className="text-white font-bold">{hoveredProvince.capital}</strong>
            </div>
          )}
        </div>
      )}

      {/* Floating Tooltip for New Merged Province */}
      {hoveredMerged && (
        <div
          id="map-merged-tooltip"
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-amber-400/80 text-xs sm:text-sm min-w-[210px] max-w-[280px] text-center animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black uppercase mb-1">
            <span>✨ Tỉnh mới đã ghép</span>
          </div>
          <div className="font-black text-lg text-amber-300 leading-tight">
            {hoveredMerged.newProvince}
          </div>
          <div className="text-slate-200 text-xs font-semibold mt-0.5">{hoveredMerged.region}</div>
          <div className="text-slate-300 text-xs mt-1.5 pt-1.5 border-t border-slate-700/70 text-left">
            <div className="font-bold text-slate-100">
              Hợp nhất từ: <span className="text-amber-200 font-semibold">{hoveredMerged.provinces.join(' + ')}</span>
            </div>
            {hoveredMerged.description && (
              <div className="text-slate-300 text-[11px] mt-1 italic leading-snug">
                {hoveredMerged.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
