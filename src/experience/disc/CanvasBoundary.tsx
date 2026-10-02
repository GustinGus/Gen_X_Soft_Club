"use client";

import { Component, type ReactNode } from "react";

/**
 * A WebGL canvas that cannot be made (no context, a lost chunk) must not take
 * the page with it: it renders nothing, and `onFail` lets the CSS posters be
 * the disc.
 */
export class CanvasBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
