const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 1000 * 60;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const getStartOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

const calculateTrackedMinutes = (startTime, endTime, maxOperatingHoursPerDay = 8) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 0;
    }

    if (end <= start) {
        return 0;
    }

    const operatingMinutesPerDay = Math.max(0, maxOperatingHoursPerDay) * MINUTES_PER_HOUR;

    if (operatingMinutesPerDay <= 0) {
        return 0;
    }

    let trackedMinutes = 0;
    let currentDayStart = getStartOfDay(start);

    while (currentDayStart < end) {
        const currentDayEnd = new Date(currentDayStart.getTime() + MILLISECONDS_PER_DAY);

        const effectiveStart = start > currentDayStart ? start : currentDayStart;
        const effectiveEnd = end < currentDayEnd ? end : currentDayEnd;

        if (effectiveEnd > effectiveStart) {
            const elapsedMinutesForDay =
                (effectiveEnd.getTime() - effectiveStart.getTime()) /
                MILLISECONDS_PER_MINUTE;

            trackedMinutes += Math.min(elapsedMinutesForDay, operatingMinutesPerDay);
        }

        currentDayStart = new Date(currentDayStart.getTime() + MILLISECONDS_PER_DAY);
    }

    return trackedMinutes;
};

const calculateEfficiency = (workingMinutes, idleMinutes) => {
    const totalTrackedMinutes = workingMinutes + idleMinutes;

    if (totalTrackedMinutes <= 0) {
        return 0;
    }

    return (workingMinutes / totalTrackedMinutes) * 100;
};

const getTrackedMinutesByStatus = (
    status,
    startTime,
    endTime,
    maxOperatingHoursPerDay = 8
) => {
    const trackedMinutes = calculateTrackedMinutes(
        startTime,
        endTime,
        maxOperatingHoursPerDay
    );

    return {
        workingMinutes: status === "busy" ? trackedMinutes : 0,
        idleMinutes: status === "idle" ? trackedMinutes : 0,
        maintenanceMinutes: status === "maintenance" ? trackedMinutes : 0,
    };
};

module.exports = {
    calculateTrackedMinutes,
    calculateEfficiency,
    getTrackedMinutesByStatus,
};
