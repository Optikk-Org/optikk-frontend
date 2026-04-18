import type uPlot from "uplot";

export interface DeploymentMarker {
  /** Unix seconds (uPlot x-axis unit). */
  readonly ts: number;
  readonly version: string;
  readonly environment: string;
}

interface PluginOptions {
  readonly markers: readonly DeploymentMarker[];
  readonly color?: string;
  readonly labelColor?: string;
  readonly font?: string;
}

function drawVerticalLines(
  u: uPlot,
  ctx: CanvasRenderingContext2D,
  markers: readonly DeploymentMarker[],
  color: string
): void {
  const { top, height } = u.bbox;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  for (const marker of markers) {
    const x = u.valToPos(marker.ts, "x", true);
    if (!Number.isFinite(x)) continue;
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, top);
    ctx.lineTo(Math.round(x) + 0.5, top + height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLabels(
  u: uPlot,
  ctx: CanvasRenderingContext2D,
  markers: readonly DeploymentMarker[],
  labelColor: string,
  font: string
): void {
  const { top } = u.bbox;
  ctx.save();
  ctx.fillStyle = labelColor;
  ctx.font = font;
  ctx.textBaseline = "top";
  for (const marker of markers) {
    const x = u.valToPos(marker.ts, "x", true);
    if (!Number.isFinite(x)) continue;
    ctx.fillText(marker.version, Math.round(x) + 4, top + 2);
  }
  ctx.restore();
}

export function deploymentMarkersPlugin({
  markers,
  color = "rgba(107,182,255,0.55)",
  labelColor = "rgba(107,182,255,0.9)",
  font = "10px system-ui, sans-serif",
}: PluginOptions): uPlot.Plugin {
  return {
    hooks: {
      draw: (u) => {
        if (markers.length === 0) return;
        const ctx = u.ctx;
        drawVerticalLines(u, ctx, markers, color);
        drawLabels(u, ctx, markers, labelColor, font);
      },
    },
  };
}
