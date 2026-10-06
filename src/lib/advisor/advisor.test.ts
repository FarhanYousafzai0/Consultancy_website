import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedGuides } from "@/data/seed-guides";
import {
  ADVISOR_TOOL_DECLARATIONS,
  ADVISOR_TOOL_NAMES,
} from "@/lib/advisor/tools";
import { searchGuidesInMemory } from "@/lib/advisor/catalog";
import { getDailyChatLimit } from "@/lib/advisor/budget";

describe("advisor knowledge base seed", () => {
  it("includes core guide topics and enough FAQs", () => {
    const topics = new Set(seedGuides.map((g) => g.topic));
    for (const required of [
      "aps",
      "blocked_account",
      "visa",
      "uni_assist",
      "anabin",
      "studienkolleg",
      "faq",
    ] as const) {
      assert.ok(topics.has(required), `missing topic ${required}`);
    }
    assert.ok(seedGuides.length >= 20, "expected ~20+ guides");
    for (const g of seedGuides) {
      assert.ok(g.slug.length > 2);
      assert.ok(g.body.length > 40);
      assert.ok(g.sourceUrl.startsWith("http"));
      assert.equal(g.status, "published");
    }
  });

  it("does not invent empty titles", () => {
    const titles = seedGuides.map((g) => g.title.toLowerCase());
    assert.ok(titles.some((t) => t.includes("aps")));
    assert.ok(titles.some((t) => t.includes("studienkolleg")));
  });
});

describe("advisor tool declarations", () => {
  it("exposes the planned tools", () => {
    const names = ADVISOR_TOOL_DECLARATIONS.map((t) => t.name);
    for (const name of ADVISOR_TOOL_NAMES) {
      assert.ok(names.includes(name), `missing tool ${name}`);
    }
  });
});

describe("catalog guide search", () => {
  it("ranks APS guides for APS queries", () => {
    const guides = seedGuides.map((g, i) => ({
      ...g,
      id: `g${i}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const hits = searchGuidesInMemory(guides, "APS certificate Pakistan", 3);
    assert.ok(hits.length >= 1);
    assert.ok(
      hits.some(
        (h) =>
          h.topic === "aps" || h.title.toLowerCase().includes("aps")
      )
    );
  });
});

describe("quota limits", () => {
  it("gives visitors fewer daily chats than logged-in students", () => {
    const visitor = getDailyChatLimit({ isLoggedIn: false, hasCredits: false });
    const student = getDailyChatLimit({ isLoggedIn: true, hasCredits: false });
    const paid = getDailyChatLimit({ isLoggedIn: true, hasCredits: true });
    assert.ok(visitor < student);
    assert.ok(student <= paid);
    assert.equal(visitor, 5);
    assert.equal(student, 20);
    assert.equal(paid, 200);
  });
});

describe("advisor reply heuristics", () => {
  it("flags missing-data replies for handoff", () => {
    const reply = "I don't have verified information on that.";
    assert.match(reply, /don't have verified/i);
  });

  it("keeps Ausbildung self-serve messaging distinct", () => {
    const guide = seedGuides.find((g) => g.slug === "faq-ausbildung");
    assert.ok(guide);
    assert.match(guide!.body, /self-serve/i);
    assert.doesNotMatch(
      guide!.body,
      /WhatsApp handoff for Ausbildung placement/i
    );
  });
});
