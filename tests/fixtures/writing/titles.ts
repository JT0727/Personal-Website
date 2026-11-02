/** Unique titles used only in test fixtures. Must never appear in content/ or out/. */
export const WRITING_FIXTURE_TITLES = [
  "ZXQ Writing Fixture Aurora",
  "ZXQ Writing Fixture Beacon",
  "ZXQ Writing Fixture Cedar",
] as const;

export const WRITING_FIXTURE_CAP_TITLES = [
  "ZXQ Writing Fixture Drift",
  "ZXQ Writing Fixture Ember",
  "ZXQ Writing Fixture Flint",
] as const;

export const WRITING_FIXTURE_DROPPED_TITLES = [
  "ZXQ Writing Fixture Dropped Host",
  "ZXQ Writing Fixture Dropped Http",
] as const;

export const WRITING_FIXTURE_ALL_TITLES = [
  ...WRITING_FIXTURE_TITLES,
  ...WRITING_FIXTURE_CAP_TITLES,
  ...WRITING_FIXTURE_DROPPED_TITLES,
] as const;

export const WRITING_FIXTURE_SECRET_BODY = "ZXQ_WRITING_FIXTURE_SECRET_BODY";

export const WRITING_FIXTURE_LONG_BLURB =
  "ZXQ aurora blurb start. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word. Alpha word.";
