import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import {
  exportEnergyMix,
  exportEnergyOverview,
  useEnergyMix,
  useEnergyOverview,
} from '@/legacy/lib/api';
import { LEVEL2_HEBREW_COLORS } from '@/legacy/lib/colors';
import { getDieselFromNonRenewablesLevel2 } from '@/legacy/lib/energyMixFossilDiesel';

// Shared chart height so both overview (line) and energy mix (pie) cards match Figma
export const HOME_CHART_HEIGHT = 400;

const getLast7DaysDateRange = () => {
  const today = new Date();
  return {
    start: format(subDays(today, 6), 'yyyy-MM-dd'),
    end: format(today, 'yyyy-MM-dd'),
  };
};

export const toDateRangePickerValue = (range: {
  start: string;
  end: string;
}): [Date, Date] => [parseISO(range.start), parseISO(range.end)];

// Retain the original chart controller without fetching data for the disabled home-page TODO.
export function useHomeEnergyCharts() {
  const [showMixLevel2, setShowMixLevel2] = useState(false);
  const [showOverviewLevel2, setShowOverviewLevel2] = useState(false);

  // Date range picker state for energy mix (matches DateRangePicker last7Days preset)
  const [startEndMixDate, setStartEndMixDate] = useState(getLast7DaysDateRange);

  // Date range picker state for overview chart
  const [overviewSelectedPreset, setOverviewSelectedPreset] =
    useState<string>('7 ימים אחרונים');
  const [startEndOverviewDate, setStartEndOverviewDate] =
    useState(getLast7DaysDateRange);
  //tooltips
  const [showMixTooltip, setShowMixTooltip] = useState(false);
  const [showOverviewTooltip, setShowOverviewTooltip] = useState(false);

  // Handle date range change from DateRangePicker
  const handleMixDateRangeChange = (startDate: string, endDate: string) => {
    setStartEndMixDate({ start: startDate, end: endDate });
  };

  const handleOverviewDateRangeChange = (startDate: string, endDate: string) => {
    setStartEndOverviewDate({ start: startDate, end: endDate });
  };

  const handleMixExport = async () => {
    try {
      await exportEnergyMix(startEndMixDate.start, startEndMixDate.end);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleOverviewExport = async () => {
    try {
      await exportEnergyOverview(startEndOverviewDate.start, startEndOverviewDate.end);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Fetch energy mix data from API (for Chart2 - line chart)
  const {
    data: energyMixData,
    isLoading: isLoadingEnergyMix,
    error: energyMixError,
  } = useEnergyMix(startEndMixDate.start, startEndMixDate.end);

  useEffect(() => {
    if (!energyMixData?.start_date || !energyMixData?.end_date) return;
    const { start_date, end_date } = energyMixData;
    setStartEndMixDate((prev) => {
      if (prev.start === start_date && prev.end === end_date) return prev;
      return { start: start_date, end: end_date };
    });
  }, [energyMixData?.start_date, energyMixData?.end_date]);

  // Fetch energy overview data from API (for pie chart)
  const {
    data: energyOverviewData,
    isLoading: isLoadingEnergyOverview,
    error: energyOverviewError,
  } = useEnergyOverview(
    startEndOverviewDate.start,
    startEndOverviewDate.end,
    overviewSelectedPreset,
  );

  useEffect(() => {
    if (!energyOverviewData?.start_date || !energyOverviewData?.end_date) return;
    const { start_date, end_date } = energyOverviewData;
    setStartEndOverviewDate((prev) => {
      if (prev.start === start_date && prev.end === end_date) return prev;
      return { start: start_date, end: end_date };
    });
  }, [energyOverviewData?.start_date, energyOverviewData?.end_date]);

  // Transform energy mix series data for Chart2 - uses label from API response for X-axis
  const chart2Data = useMemo(() => {
    if (!energyOverviewData?.series) return null;

    // Use period field for date parsing (more reliable than label)
    const dates = energyOverviewData.series.map((item) => item.period || item.label);
    const series: Array<{ name: string; data: number[]; color?: string }> = [];

    if (showOverviewLevel2) {
      // Show level 2 breakdown
      // Helper function to get value from item (check both direct fields and level2 object)
      const getValue = (
        item: (typeof energyOverviewData.series)[0],
        key: string,
      ): number => {
        // סולר (Chart2 only): solar_thermal / solar — never server diesel_mw or תרמו סולרי
        if (key === 'diesel') {
          const nonRenewables =
            item.level2?.['Non-renewables'] ??
            (item.level2 as { non_renewables?: Record<string, number> } | undefined)
              ?.non_renewables;
          if (nonRenewables) {
            return getDieselFromNonRenewablesLevel2(nonRenewables);
          }
          if (typeof item.solar_thermal_mw === 'number') {
            return item.solar_thermal_mw;
          }
          return 0;
        }

        // solar_thermal_mw is non-renewable diesel — do not use for other series
        if (key === 'solar_thermal' || key === 'thermo') {
          return 0;
        }

        const directKey = `${key}_mw` as keyof typeof item;
        if (directKey in item && typeof item[directKey] === 'number') {
          return item[directKey] as number;
        }

        if (item.level2) {
          if (key === 'coal') {
            return item.level2['Non-renewables']?.coal ?? 0;
          }
          if (key === 'natural_gas') {
            return item.level2['Non-renewables']?.natural_gas ?? 0;
          }
          if (key === 'photoVoltaic') {
            return item.level2.Renewables?.photoVoltaic ?? 0;
          }
          if (key === 'biogas') {
            return item.level2.Renewables?.biogas ?? 0;
          }
          if (key === 'wind') {
            return item.level2.Renewables?.wind ?? 0;
          }
          if (key === 'pv_storage') {
            return item.level2.Renewables?.pv_storage ?? 0;
          }
          if (key === 'other') {
            return item.level2.Other?.other ?? 0;
          }
          if (key === 'pumped_storage') {
            return item.level2.Other?.pumped_storage ?? 0;
          }
        }
        return 0;
      };

      // Fossil Energy sources
      if (energyOverviewData.series.some((item) => getValue(item, 'coal') > 0)) {
        series.push({
          name: 'פחם',
          data: energyOverviewData.series.map((item) => getValue(item, 'coal')),
          color: LEVEL2_HEBREW_COLORS['פחם'],
        });
      }
      if (energyOverviewData.series.some((item) => getValue(item, 'natural_gas') > 0)) {
        series.push({
          name: 'גז טבעי',
          data: energyOverviewData.series.map((item) => getValue(item, 'natural_gas')),
          color: LEVEL2_HEBREW_COLORS['גז טבעי'],
        });
      }
      if (energyOverviewData.series.some((item) => getValue(item, 'diesel') > 0)) {
        series.push({
          name: 'סולר',
          data: energyOverviewData.series.map((item) => getValue(item, 'diesel')),
          color: LEVEL2_HEBREW_COLORS['סולר'],
        });
      }

      // Renewable Energy sources
      if (energyOverviewData.series.some((item) => getValue(item, 'photoVoltaic') > 0)) {
        series.push({
          name: 'פוטו וולטאי',
          data: energyOverviewData.series.map((item) => getValue(item, 'photoVoltaic')),
          color: LEVEL2_HEBREW_COLORS['פוטו וולטאי'],
        });
      }
      if (energyOverviewData.series.some((item) => getValue(item, 'biogas') > 0)) {
        series.push({
          name: 'ביו גז',
          data: energyOverviewData.series.map((item) => getValue(item, 'biogas')),
          color: LEVEL2_HEBREW_COLORS['ביו גז'],
        });
      }
      if (energyOverviewData.series.some((item) => getValue(item, 'wind') > 0)) {
        series.push({
          name: 'רוח',
          data: energyOverviewData.series.map((item) => getValue(item, 'wind')),
          color: LEVEL2_HEBREW_COLORS['רוח'],
        });
      }
      if (energyOverviewData.series.some((item) => getValue(item, 'pv_storage') > 0)) {
        series.push({
          name: 'פוטו וולטאי משולב אגירה',
          data: energyOverviewData.series.map((item) => getValue(item, 'pv_storage')),
          color: LEVEL2_HEBREW_COLORS['פוטו וולטאי משולב אגירה'],
        });
      }

      // Other sources
      if (energyOverviewData.series.some((item) => getValue(item, 'other') > 0)) {
        series.push({
          name: 'אחר',
          data: energyOverviewData.series.map((item) => getValue(item, 'other')),
          color: LEVEL2_HEBREW_COLORS['אחר'],
        });
      }
      if (energyOverviewData.series.some((item) => getValue(item, 'pumped_storage') > 0)) {
        series.push({
          name: 'אגירה שאובה',
          data: energyOverviewData.series.map((item) => getValue(item, 'pumped_storage')),
          color: LEVEL2_HEBREW_COLORS['אגירה שאובה'],
        });
      }
    } else {
      // Show level 1 only
      series.push(
        {
          name: 'אנרגיות פוסיליות',
          data: energyOverviewData.series.map((item) => item.non_renewables_mw),
          color: '#f59e0b',
        },
        {
          name: 'אנרגיות מתחדשות',
          data: energyOverviewData.series.map((item) => item.renewables_mw),
          color: '#10b981',
        },
        {
          name: 'אחר',
          data: energyOverviewData.series.map((item) => item.other_mw),
          color: '#64748b',
        },
      );
    }

    return { dates, series };
  }, [energyOverviewData, showOverviewLevel2]);

  return {
    showMixLevel2, setShowMixLevel2,
    showOverviewLevel2, setShowOverviewLevel2,
    startEndMixDate, startEndOverviewDate,
    overviewSelectedPreset, setOverviewSelectedPreset,
    showMixTooltip, setShowMixTooltip,
    showOverviewTooltip, setShowOverviewTooltip,
    handleMixDateRangeChange, handleOverviewDateRangeChange,
    handleMixExport, handleOverviewExport,
    energyMixData, isLoadingEnergyMix, energyMixError,
    energyOverviewData, isLoadingEnergyOverview, energyOverviewError,
    chart2Data,
  };
}
