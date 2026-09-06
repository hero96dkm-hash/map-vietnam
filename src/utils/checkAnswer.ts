import type { Province, ProvinceGroup, CheckResult } from '../types/game';

/**
 * Kiểm tra xem danh sách các tỉnh cũ học sinh lớp 5 vừa click chọn
 * có ghép đúng thành một tỉnh mới hay không.
 */
export function checkAnswer(
  selectedProvinces: Province[],
  allGroups: ProvinceGroup[]
): CheckResult {
  if (selectedProvinces.length === 0) {
    return {
      isCorrect: false,
      message: 'Em chưa chọn tỉnh nào trên bản đồ!',
      selectedProvinces: [],
      hints: ['Hãy bấm chọn các tỉnh cũ trên bản đồ rồi bấm Kiểm tra nhé.']
    };
  }

  const selectedNames = selectedProvinces.map((p) => p.oldProvince);

  // Kiểm tra xem các tỉnh chọn có khớp với bất kỳ nhóm tỉnh mới nào không
  for (const group of allGroups) {
    const groupNames = group.provinces;
    if (
      groupNames.length === selectedNames.length &&
      groupNames.every((name) => selectedNames.includes(name)) &&
      selectedNames.every((name) => groupNames.includes(name))
    ) {
      return {
        isCorrect: true,
        matchedGroup: group,
        message: `Tuyệt vời! Em đã ghép đúng và tạo thành "${group.newProvince}"!`,
        selectedProvinces
      };
    }
  }

  // Nếu chỉ mới chọn 1 tỉnh
  if (selectedNames.length === 1) {
    const current = selectedProvinces[0];

    // Nếu tỉnh thuộc nhóm 11 tỉnh giữ nguyên
    if (current.isKept) {
      return {
        isCorrect: false,
        message: `"${current.oldProvince}" là 1 trong 11 tỉnh/thành phố giữ nguyên trạng, không thực hiện sắp xếp/sáp nhập năm 2025!`,
        selectedProvinces,
        hints: [
          `Đơn vị này giữ nguyên ranh giới diện tích tự nhiên và dân số (mới: ${current.newProvince}).`,
          'Em hãy chọn các tỉnh khác cần sáp nhập để tiếp tục thử thách nhé!'
        ]
      };
    }

    const relatedGroup = allGroups.find((g) => g.provinces.includes(current.oldProvince));
    const hints: string[] = [
      'Một tỉnh mới cần ít nhất 2 đến 3 tỉnh cũ ghép lại.',
      relatedGroup
        ? `Gợi ý: Tỉnh "${current.oldProvince}" sáp nhập với tỉnh lân cận để tạo thành "${relatedGroup.newProvince}".`
        : 'Hãy chọn thêm tỉnh nằm cạnh tỉnh này nhé!'
    ];

    return {
      isCorrect: false,
      message: `Em mới chỉ chọn 1 tỉnh là "${current.oldProvince}". Hãy chọn thêm tỉnh cũ khác để ghép nhé!`,
      selectedProvinces,
      hints
    };
  }

  // Nếu chọn nhiều tỉnh nhưng chưa khớp
  const hints: string[] = [];

  // Tìm xem có tỉnh nào thuộc cùng một nhóm không để gợi ý
  for (const group of allGroups) {
    const common = group.provinces.filter((name) => selectedNames.includes(name));
    if (common.length >= 1) {
      const missing = group.provinces.filter((name) => !selectedNames.includes(name));
      const extra = selectedNames.filter((name) => !group.provinces.includes(name));
      if (extra.length === 0 && missing.length > 0) {
        hints.push(`Em đã chọn ${common.join(', ')}. Em cần chọn thêm ${missing.length} tỉnh nữa để tạo thành "${group.newProvince}"!`);
        break;
      }
    }
  }

  if (hints.length === 0) {
    // Kiểm tra xem các tỉnh có cùng vùng miền không
    const regions = Array.from(new Set(selectedProvinces.map((p) => p.region)));
    if (regions.length > 1) {
      hints.push(`Các tỉnh em chọn đang ở khác vùng miền (${regions.join(', ')}). Khi sáp nhập, các tỉnh thường nằm liền kề nhau.`);
    } else {
      hints.push('Các tỉnh này chưa nằm trong phương án ghép tỉnh mới. Em hãy thử chọn lại nhé!');
    }
  }

  return {
    isCorrect: false,
    message: 'Nhóm các tỉnh em vừa chọn chưa tạo thành tỉnh mới theo quy hoạch.',
    selectedProvinces,
    hints
  };
}
