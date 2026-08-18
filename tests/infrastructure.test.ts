import { expect, it } from "vitest";
import { STAGE_TO_NODE } from "../components/assembly/AsmInfrastructure";

it("pins every curriculum stage to the utility chain", () => {
  expect(STAGE_TO_NODE).toEqual({
    "grid-interface": "substation",
    network: "switchgear",
    facility: "ups",
    scale: "rack",
  });
});
