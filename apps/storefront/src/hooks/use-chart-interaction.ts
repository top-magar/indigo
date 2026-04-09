"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  ExportFormat,
  type ChartDataPoint,
  type DrillDownDataPoint,
  type DrillDownLevel,
  type DrillDownState,
  type ZoomState,
  type PanState,
  type ChartInteractionState,
  type ChartType,
  type ExportOptions,
  type ExportResult,
} from "@/components/dashboard/charts/chart-types";

// ============================================================================
// Default States
// ============================================================================

const DEFAULT_ZOOM: ZoomState = {
  left: 0,
  right: 1,
  top: 0,
  bottom: 1,
  scale: 1,
};

const DEFAULT_PAN: PanState = {
  x: 0,
  y: 0,
};

// ============================================================================
// Hook Options
// ============================================================================

interface UseChartInteractionOptions {
  /** Initial chart type */
  initialChartType?: ChartType;
  /** Initial visible series */
  initialVisibleSeries?: string[];
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable pan */
  enablePan?: boolean;
  /** Zoom sensitivity */
  zoomSensitivity?: number;
  /** Max zoom level */
  maxZoom?: number;
  /** Min zoom level */
  minZoom?: number;
}

interface UseChartInteractionReturn {
  // State
  state: ChartInteractionState;
  
  // Zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoomArea: (left: number, right: number) => void;
  
  // Pan controls
  pan: (deltaX: number, deltaY: number) => void;
  resetPan: () => void;
  
  // Selection
  selectPoint: (point: ChartDataPoint | undefined) => void;
  setHoveredPoint: (point: ChartDataPoint | undefined) => void;
  
  // Series visibility
  toggleSeries: (seriesKey: string) => void;
  showAllSeries: () => void;
  hideAllSeries: () => void;
  setVisibleSeries: (keys: string[]) => void;
  
  // Fullscreen
  toggleFullscreen: () => void;
  setFullscreen: (value: boolean) => void;
  
  // Chart type
  setChartType: (type: ChartType) => void;
  
  // Export
  exportChart: (options: ExportOptions, chartRef: React.RefObject<HTMLDivElement | null>) => Promise<ExportResult>;
  exportData: (data: ChartDataPoint[], options: ExportOptions) => ExportResult;
  
  // Drill-down
  drillDown: DrillDownState;
  navigateDown: (point: DrillDownDataPoint, childData: DrillDownDataPoint[]) => void;
  navigateUp: () => void;
  navigateToLevel: (levelIndex: number) => void;
  resetDrillDown: () => void;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useChartInteraction(
  options: UseChartInteractionOptions = {}
): UseChartInteractionReturn {
  const {
    initialChartType = "line",
    initialVisibleSeries = [],
    enableZoom = true,
    zoomSensitivity = 0.1,
    maxZoom = 10,
    minZoom = 1,
  } = options;

  // ============================================================================
  // State
  // ============================================================================

  const [zoom, setZoom] = useState<ZoomState>(DEFAULT_ZOOM);
  const [panState, setPan] = useState<PanState>(DEFAULT_PAN);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | undefined>();
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | undefined>();
  const [visibleSeries, setVisibleSeriesState] = useState<Set<string>>(
    new Set(initialVisibleSeries)
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartType, setChartTypeState] = useState<ChartType>(initialChartType);

  // Drill-down state
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    currentLevel: 0,
    levelStack: [],
    selectedPoint: undefined,
  });

  // Refs for tracking
  const allSeriesRef = useRef<string[]>([]);

  // ============================================================================
  // Computed State
  // ============================================================================

  const state = useMemo<ChartInteractionState>(
    () => ({
      zoom,
      pan: panState,
      selectedPoint,
      hoveredPoint,
      visibleSeries,
      isFullscreen,
      chartType,
    }),
    [zoom, panState, selectedPoint, hoveredPoint, visibleSeries, isFullscreen, chartType]
  );

  // ============================================================================
  // Zoom Controls
  // ============================================================================

  const zoomIn = useCallback(() => {
    if (!enableZoom) return;
    setZoom((prev) => {
      const newScale = Math.min(prev.scale * (1 + zoomSensitivity), maxZoom);
      const center = 0.5;
      const newWidth = 1 / newScale;
      return {
        ...prev,
        scale: newScale,
        left: Math.max(0, center - newWidth / 2),
        right: Math.min(1, center + newWidth / 2),
      };
    });
  }, [enableZoom, zoomSensitivity, maxZoom]);

  const zoomOut = useCallback(() => {
    if (!enableZoom) return;
    setZoom((prev) => {
      const newScale = Math.max(prev.scale * (1 - zoomSensitivity), minZoom);
      if (newScale <= 1) {
        return DEFAULT_ZOOM;
      }
      const center = (prev.left + prev.right) / 2;
      const newWidth = 1 / newScale;
      return {
        ...prev,
        scale: newScale,
        left: Math.max(0, center - newWidth / 2),
        right: Math.min(1, center + newWidth / 2),
      };
    });
  }, [enableZoom, zoomSensitivity, minZoom]);

  const resetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
  }, []);

  const setZoomArea = useCallback(
    (left: number, right: number) => {
      if (!enableZoom) return;
      const width = right - left;
      const scale = 1 / width;
      if (scale <= maxZoom && scale >= minZoom) {
        setZoom({
          left: Math.max(0, left),
          right: Math.min(1, right),
          top: 0,
          bottom: 1,
          scale,
        });
      }
    },
    [enableZoom, maxZoom, minZoom]
  );

  // ============================================================================
  // Pan Controls
  // ============================================================================

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setPan((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  const resetPan = useCallback(() => {
    setPan(DEFAULT_PAN);
  }, []);

  // ============================================================================
  // Selection Controls
  // ============================================================================

  const selectPoint = useCallback((point: ChartDataPoint | undefined) => {
    setSelectedPoint(point);
  }, []);

  const setHoveredPointCallback = useCallback((point: ChartDataPoint | undefined) => {
    setHoveredPoint(point);
  }, []);

  // ============================================================================
  // Series Visibility Controls
  // ============================================================================

  const toggleSeries = useCallback((seriesKey: string) => {
    setVisibleSeriesState((prev) => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  }, []);

  const showAllSeries = useCallback(() => {
    setVisibleSeriesState(new Set(allSeriesRef.current));
  }, []);

  const hideAllSeries = useCallback(() => {
    setVisibleSeriesState(new Set());
  }, []);

  const setVisibleSeries = useCallback((keys: string[]) => {
    allSeriesRef.current = keys;
    setVisibleSeriesState(new Set(keys));
  }, []);

  // ============================================================================
  // Fullscreen Controls
  // ============================================================================

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const setFullscreen = useCallback((value: boolean) => {
    setIsFullscreen(value);
  }, []);

  // ============================================================================
  // Chart Type Controls
  // ============================================================================

  const setChartType = useCallback((type: ChartType) => {
    setChartTypeState(type);
  }, []);

  // ============================================================================
  // Export Functions
  // ============================================================================

  const exportChart = useCallback(
    async (
      exportOptions: ExportOptions,
      chartRef: React.RefObject<HTMLDivElement | null>
    ): Promise<ExportResult> => {
      const { format, filename = "chart", quality = 1, backgroundColor = "#ffffff" } = exportOptions;

      if (!chartRef.current) {
        return { success: false, error: "Chart element not found" };
      }

      try {
        if (format === ExportFormat.PNG || format === ExportFormat.SVG) {
          // Dynamic import for html2canvas
          const html2canvas = (await import("html2canvas")).default;
          
          const canvas = await html2canvas(chartRef.current, {
            backgroundColor,
            scale: 2,
            useCORS: true,
          });

          if (format === ExportFormat.PNG) {
            const dataUrl = canvas.toDataURL("image/png", quality);
            const blob = await (await fetch(dataUrl)).blob();
            
            // Trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.png`;
            link.click();
            URL.revokeObjectURL(url);

            return { success: true, blob, dataUrl };
          }

          if (format === ExportFormat.SVG) {
            // For SVG, we need to serialize the SVG element
            const svgElement = chartRef.current.querySelector("svg");
            if (!svgElement) {
              return { success: false, error: "SVG element not found" };
            }

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const blob = new Blob([svgString], { type: "image/svg+xml" });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.svg`;
            link.click();
            URL.revokeObjectURL(url);

            return { success: true, blob };
          }
        }

        return { success: false, error: "Unsupported format for chart export" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Export failed",
        };
      }
    },
    []
  );

  const exportData = useCallback(
    (data: ChartDataPoint[], exportOptions: ExportOptions): ExportResult => {
      const { format, filename = "chart-data" } = exportOptions;

      try {
        let content: string;
        let mimeType: string;
        let extension: string;

        if (format === ExportFormat.CSV) {
          // Generate CSV
          const headers = ["x", "y", "label"];
          const rows = data.map((point) => [
            String(point.x),
            String(point.y),
            point.label || "",
          ]);
          content = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
          mimeType = "text/csv";
          extension = "csv";
        } else if (format === ExportFormat.JSON) {
          // Generate JSON
          content = JSON.stringify(data, null, 2);
          mimeType = "application/json";
          extension = "json";
        } else {
          return { success: false, error: "Unsupported format for data export" };
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);

        return { success: true, blob };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Export failed",
        };
      }
    },
    []
  );

  // ============================================================================
  // Drill-Down Navigation
  // ============================================================================

  const navigateDown = useCallback(
    (point: DrillDownDataPoint, childData: DrillDownDataPoint[]) => {
      const newLevel: DrillDownLevel = {
        id: point.id,
        name: point.label || String(point.x),
        data: childData,
        parentId: drillDown.levelStack[drillDown.currentLevel]?.id || null,
        filter: {
          field: "parentId",
          value: point.id,
        },
      };

      setDrillDown((prev) => ({
        currentLevel: prev.currentLevel + 1,
        levelStack: [...prev.levelStack.slice(0, prev.currentLevel + 1), newLevel],
        selectedPoint: point,
      }));
    },
    [drillDown.currentLevel, drillDown.levelStack]
  );

  const navigateUp = useCallback(() => {
    setDrillDown((prev) => {
      if (prev.currentLevel <= 0) return prev;
      return {
        ...prev,
        currentLevel: prev.currentLevel - 1,
        selectedPoint: undefined,
      };
    });
  }, []);

  const navigateToLevel = useCallback((levelIndex: number) => {
    setDrillDown((prev) => {
      if (levelIndex < 0 || levelIndex >= prev.levelStack.length) return prev;
      return {
        ...prev,
        currentLevel: levelIndex,
        selectedPoint: undefined,
      };
    });
  }, []);

  const resetDrillDown = useCallback(() => {
    setDrillDown({
      currentLevel: 0,
      levelStack: [],
      selectedPoint: undefined,
    });
  }, []);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    state,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomArea,
    pan,
    resetPan,
    selectPoint,
    setHoveredPoint: setHoveredPointCallback,
    toggleSeries,
    showAllSeries,
    hideAllSeries,
    setVisibleSeries,
    toggleFullscreen,
    setFullscreen,
    setChartType,
    exportChart,
    exportData,
    drillDown,
    navigateDown,
    navigateUp,
    navigateToLevel,
    resetDrillDown,
  };
}

export type { UseChartInteractionOptions, UseChartInteractionReturn };
