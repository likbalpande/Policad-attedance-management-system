import { UAParser } from "ua-parser-js";

// UAI = browser.name + os.name + device.vendor + device.model + device.type +
// cpu.architecture (product-idea.txt). Joined with a fixed delimiter rather than
// bare concatenation to avoid ambiguous collisions between adjacent empty fields -
// safe as long as FT (client) and PB/LAG (server) both go through this same
// function, which is the whole point of sharing it.
const UAI_DELIMITER = "::";

export function generateUai(userAgentString: string): string {
  const { browser, os, device, cpu } = new UAParser(userAgentString).getResult();
  return [
    browser.name ?? "",
    os.name ?? "",
    device.vendor ?? "",
    device.model ?? "",
    device.type ?? "",
    cpu.architecture ?? "",
  ].join(UAI_DELIMITER);
}
