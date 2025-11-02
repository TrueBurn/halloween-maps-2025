'use client';

import Link from 'next/link';
import { Clock, Play, Calendar, TrendingUp } from 'lucide-react';

export function MovementTimelineCard() {
  return (
    <div className="bg-surface rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Movement Timeline</h3>
              <p className="text-sm text-text-secondary mt-1">
                Replay user movement patterns during the event
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-4">
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">5-Minute Intervals</p>
                <p className="text-xs text-text-secondary mt-1">
                  See detailed movement patterns
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Play className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Animated Playback</p>
                <p className="text-xs text-text-secondary mt-1">
                  Watch clusters move over time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Halloween 2025</p>
                <p className="text-xs text-text-secondary mt-1">
                  Analyze yesterday's event
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-background rounded-lg border border-gray-700">
            <p className="text-sm text-text-secondary leading-relaxed">
              View an animated heatmap showing how user clusters moved throughout the Halloween event.
              Control playback speed, scrub through time intervals, and see peak activity patterns.
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href="/admin/analytics/movement-timeline"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Play className="h-4 w-4" />
            Open Movement Timeline
          </Link>
        </div>
      </div>
    </div>
  );
}
