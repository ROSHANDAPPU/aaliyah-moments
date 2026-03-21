// Pay calculation engine - exact implementation per spec
export interface PayCalcInput {
  totalSales: number;
  hoursWorked: number;
  hourlyRate: number;
  helperRatio: number; // 0-100 percentage
  isBusinessTrip: boolean;
}

export interface PayCalcResult {
  commissionRate: number;
  commissionPay: number;
  hourlyPay: number;
  finalPay: number;
  overageTip: number;
  isBonusTier: boolean;
  isHelperLocked: boolean;
  payMethod: "commission" | "hourly";
}

export function calculatePay(input: PayCalcInput): PayCalcResult {
  const { totalSales, hoursWorked, hourlyRate, helperRatio, isBusinessTrip } = input;

  let commissionRate: number;
  let isBonusTier = false;
  let isHelperLocked = false;

  // CRITICAL: Helper ratio check MUST run BEFORE bonus check
  if (isBusinessTrip) {
    if (helperRatio >= 50) {
      commissionRate = 4.0;
      isHelperLocked = true;
    } else if (totalSales >= 40) {
      commissionRate = 5.0;
      isBonusTier = true;
    } else {
      commissionRate = 4.0;
    }
  } else {
    // Normal Day
    if (helperRatio >= 50) {
      commissionRate = 3.0;
      isHelperLocked = true;
    } else if (totalSales >= 40) {
      commissionRate = 4.0;
      isBonusTier = true;
    } else {
      commissionRate = 3.0;
    }
  }

  const commissionPay = commissionRate * totalSales;
  const hourlyPay = hourlyRate * hoursWorked;
  const finalPay = Math.max(commissionPay, hourlyPay);
  const overageTip = finalPay > hourlyPay ? finalPay - hourlyPay : 0;

  return {
    commissionRate,
    commissionPay,
    hourlyPay,
    finalPay,
    overageTip,
    isBonusTier,
    isHelperLocked,
    payMethod: commissionPay >= hourlyPay ? "commission" : "hourly",
  };
}

// Sales pace projector
export function projectSales(
  currentSales: number,
  elapsedMinutes: number,
  scheduledEndMinutes: number
) {
  if (elapsedMinutes <= 0) return { pacePerHour: 0, projectedTotal: currentSales, remainingHours: 0 };
  const pacePerHour = (currentSales / elapsedMinutes) * 60;
  const remainingMinutes = Math.max(0, scheduledEndMinutes - elapsedMinutes);
  const remainingHours = remainingMinutes / 60;
  const projectedTotal = Math.round(currentSales + pacePerHour * remainingHours);
  return { pacePerHour: Math.round(pacePerHour * 10) / 10, projectedTotal, remainingHours };
}

// GPS distance check (Haversine formula)
export function isWithinGeofence(
  userLat: number, userLng: number,
  venueLat: number, venueLng: number,
  radiusMeters: number
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = (venueLat - userLat) * Math.PI / 180;
  const dLng = (venueLng - userLng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(venueLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radiusMeters;
}
