import assert from "node:assert/strict";
import test from "node:test";
import { safeHttpsUrl, safeWhatsAppUrl, whatsappLink } from "@/lib/site";

test("WhatsApp links are absent when no public number is configured", () => {
  assert.equal(whatsappLink("Hello"), null);
});

test("community links accept only secure WhatsApp destinations", () => {
  assert.equal(
    safeWhatsAppUrl("https://chat.whatsapp.com/example-invite"),
    "https://chat.whatsapp.com/example-invite"
  );
  assert.equal(safeWhatsAppUrl("http://chat.whatsapp.com/example-invite"), null);
  assert.equal(safeWhatsAppUrl("https://example.com/fake-contact"), null);
  assert.equal(safeHttpsUrl("https://example.com/registration"), "https://example.com/registration");
});
