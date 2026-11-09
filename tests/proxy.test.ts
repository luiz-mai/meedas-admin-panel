import test from "node:test";
import assert from "node:assert/strict";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../proxy";
test("admin assets bypass session refresh and administrative pages remain covered", () => {
  for (const url of [
    "/icon.svg",
    "/icon.png",
    "/apple-icon.png",
    "/brand/wordmark-transparent.png",
    "/_next/static/app.js",
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), false, url);
  }
  for (const url of [
    "/login",
    "/stores",
    "/users",
    "/crawls",
    "/subscriptions",
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), true, url);
  }
});
