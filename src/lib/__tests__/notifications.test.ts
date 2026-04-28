import { describe, it, expect } from "vitest";
import {
  notificationTypeForHole,
  detectChangedHoleIndices,
  findClearLeader,
} from "../notifications";

describe("notificationTypeForHole", () => {
  it("returns HOLE_IN_ONE for strokes=1 regardless of par", () => {
    expect(notificationTypeForHole(1, 3)).toBe("HOLE_IN_ONE");
    expect(notificationTypeForHole(1, 5)).toBe("HOLE_IN_ONE");
  });

  it("returns DOUBLE_EAGLE for 3-under (strokes > 1)", () => {
    expect(notificationTypeForHole(2, 5)).toBe("DOUBLE_EAGLE");
    expect(notificationTypeForHole(3, 6)).toBe("DOUBLE_EAGLE");
  });

  it("HOLE_IN_ONE takes precedence over DOUBLE_EAGLE when strokes=1 on par 4", () => {
    expect(notificationTypeForHole(1, 4)).toBe("HOLE_IN_ONE");
  });

  it("returns EAGLE for 2-under", () => {
    expect(notificationTypeForHole(2, 4)).toBe("EAGLE");
    expect(notificationTypeForHole(3, 5)).toBe("EAGLE");
  });

  it("returns BIRDIE for 1-under", () => {
    expect(notificationTypeForHole(3, 4)).toBe("BIRDIE");
    expect(notificationTypeForHole(2, 3)).toBe("BIRDIE");
  });

  it("returns null for even par", () => {
    expect(notificationTypeForHole(4, 4)).toBeNull();
    expect(notificationTypeForHole(3, 3)).toBeNull();
  });

  it("returns null for over par", () => {
    expect(notificationTypeForHole(5, 4)).toBeNull();
    expect(notificationTypeForHole(6, 5)).toBeNull();
  });
});

describe("detectChangedHoleIndices", () => {
  it("returns indices where newHoles has a non-null value differing from prevHoles", () => {
    const prev = Array(18).fill(null) as (number | null)[];
    const next = [...prev];
    next[2] = 3;
    next[7] = 4;
    expect(detectChangedHoleIndices(prev, next)).toEqual([2, 7]);
  });

  it("includes par-to-birdie corrections", () => {
    const prev = Array(18).fill(4) as (number | null)[];
    const next = [...prev];
    next[4] = 3;
    expect(detectChangedHoleIndices(prev, next)).toEqual([4]);
  });

  it("includes birdie-to-par corrections (notificationTypeForHole will return null for par — no notification fired)", () => {
    const prev = Array(18).fill(3) as (number | null)[];
    const next = [...prev];
    next[4] = 4;
    expect(detectChangedHoleIndices(prev, next)).toEqual([4]);
  });

  it("excludes holes where newHoles is null", () => {
    const prev = Array(18).fill(4) as (number | null)[];
    const next = [...prev];
    next[0] = null;
    expect(detectChangedHoleIndices(prev, next)).toEqual([]);
  });

  it("excludes holes that are unchanged", () => {
    const prev = Array(18).fill(4) as (number | null)[];
    const next = [...prev];
    expect(detectChangedHoleIndices(prev, next)).toEqual([]);
  });

  it("treats null-to-null as unchanged", () => {
    const prev = Array(18).fill(null) as (number | null)[];
    const next = Array(18).fill(null) as (number | null)[];
    expect(detectChangedHoleIndices(prev, next)).toEqual([]);
  });
});

describe("findClearLeader", () => {
  it("returns null when standings is empty", () => {
    expect(findClearLeader([])).toBeNull();
  });

  it("returns the single player's id when only one player", () => {
    expect(findClearLeader([{ playerId: "a", totalToPar: -3 }])).toBe("a");
  });

  it("returns null when two players are tied at #1", () => {
    expect(
      findClearLeader([
        { playerId: "a", totalToPar: -3 },
        { playerId: "b", totalToPar: -3 },
      ])
    ).toBeNull();
  });

  it("returns the leading player when there is a clear single leader", () => {
    expect(
      findClearLeader([
        { playerId: "a", totalToPar: -4 },
        { playerId: "b", totalToPar: -2 },
        { playerId: "c", totalToPar: 0 },
      ])
    ).toBe("a");
  });

  it("returns null when tied players are followed by others", () => {
    expect(
      findClearLeader([
        { playerId: "a", totalToPar: -3 },
        { playerId: "b", totalToPar: -3 },
        { playerId: "c", totalToPar: 0 },
      ])
    ).toBeNull();
  });
});
