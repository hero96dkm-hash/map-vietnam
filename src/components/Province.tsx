import React from 'react';
import type { Province as ProvinceType, ProvinceStatus } from '../types/game';

interface ProvinceProps {
  province: ProvinceType;
  pathData: string;
  status: ProvinceStatus;
  isCompleted: boolean;
  completedColor?: string;
  onSelect: (id: number) => void;
  onHover: (province: ProvinceType | null, event?: React.MouseEvent) => void;
}

export const Province: React.FC<ProvinceProps> = ({
  province,
  pathData,
  status,
  isCompleted,
  completedColor,
  onSelect,
  onHover,
}) => {
  // Determine fill color based on status
  let fillColor = '#cbd5e1'; // Mặc định chưa chọn (slate-300)
  let strokeColor = '#ffffff';
  let strokeWidth = 1.2;
  let customClass = 'province-path cursor-pointer';

  if (isCompleted) {
    // Đã hoàn thành ghép đúng: Màu vàng rực rỡ hoặc màu nhóm
    fillColor = completedColor || '#f59e0b';
    strokeColor = '#b45309';
    strokeWidth = 1.8;
    customClass += ' province-correct-glow';
  } else if (status === 'selected') {
    // Đang được chọn: Màu xanh dương năng động
    fillColor = '#3b82f6';
    strokeColor = '#1d4ed8';
    strokeWidth = 2;
  } else if (status === 'wrong') {
    // Chọn sai: Màu đỏ dịu cảnh báo nhẹ nhàng
    fillColor = '#f87171';
    strokeColor = '#b91c1c';
    strokeWidth = 2;
    customClass += ' animate-gentle-shake';
  } else if (status === 'correct') {
    // Vừa chọn đúng: Vàng sáng
    fillColor = '#eab308';
    strokeColor = '#ca8a04';
    strokeWidth = 2;
    customClass += ' province-correct-glow';
  } else {
    // Màu theo vùng miền dịu mắt khi chưa chọn
    if (province.region.includes('Tây Bắc')) fillColor = '#a7f3d0'; // Mint
    else if (province.region.includes('Đông Bắc')) fillColor = '#bae6fd'; // Sky
    else if (province.region.includes('Đồng bằng sông Hồng')) fillColor = '#fed7aa'; // Peach
    else if (province.region.includes('Bắc Trung')) fillColor = '#fde68a'; // Yellow
    else if (province.region.includes('Nam Trung')) fillColor = '#c7d2fe'; // Indigo
    else if (province.region.includes('Tây Nguyên')) fillColor = '#fbcfe8'; // Pink
    else if (province.region.includes('Đông Nam')) fillColor = '#bbf7d0'; // Emerald
    else fillColor = '#d9f99d'; // Lime
  }

  return (
    <g
      id={`province-group-${province.id}`}
      onClick={() => onSelect(province.id)}
      onMouseEnter={(e) => onHover(province, e)}
      onMouseLeave={() => onHover(null)}
      className="transition-all duration-200"
    >
      <path
        id={province.code}
        d={pathData || province.svgPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        className={customClass}
      />
    </g>
  );
};
