import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADVISOR_GREETING_REPLY,
  ADVISOR_OFF_TOPIC_REPLY,
  cannedReplyForIntent,
  classifyAdvisorIntent,
} from "@/lib/advisor/zone";

const fixtureQuestions = [
  "Do I need APS from Pakistan?",
  "What is a blocked account?",
  "uni-assist vs direct application",
  "Will I get into TUM with 2.8 German grade?",
  "DAAD scholarship odds for Master's CS",
  "Studienkolleg after FSc",
  "IELTS for English-taught Master's",
  "Winter semester deadlines",
  "What documents for Master's",
  "Can you guarantee admission?",
  "Ausbildung consultant please",
  "How does anabin work?",
  "Student visa documents",
  "SOP tips for Germany",
  "Public vs private university cost",
];

describe("classifyAdvisorIntent", () => {
  it("marks all fixture study questions as in_zone", () => {
    for (const q of fixtureQuestions) {
      assert.equal(
        classifyAdvisorIntent(q),
        "in_zone",
        `expected in_zone for: ${q}`
      );
    }
  });

  it("keeps mixed messages in zone when they mention domain topics", () => {
    assert.equal(
      classifyAdvisorIntent("weather in Berlin and DAAD scholarships"),
      "in_zone"
    );
    assert.equal(
      classifyAdvisorIntent("write a poem about APS"),
      "in_zone"
    );
  });

  it("classifies short greetings", () => {
    for (const g of ["hi", "Hello!", "salam", "thanks", "good morning"]) {
      assert.equal(classifyAdvisorIntent(g), "greeting", g);
    }
  });

  it("refuses clear off-topic questions", () => {
    for (const q of [
      "write a poem",
      "best pizza in Lahore",
      "UK universities ranking",
      "how do I cook pasta",
      "explain quantum physics",
    ]) {
      assert.equal(classifyAdvisorIntent(q), "off_topic", q);
    }
  });
});

describe("cannedReplyForIntent", () => {
  it("returns greeting and refuse copy", () => {
    assert.equal(cannedReplyForIntent("greeting"), ADVISOR_GREETING_REPLY);
    assert.equal(cannedReplyForIntent("off_topic"), ADVISOR_OFF_TOPIC_REPLY);
    assert.match(ADVISOR_OFF_TOPIC_REPLY, /studying in Germany/i);
  });
});
