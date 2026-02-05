import {
  SIGNALING_SERVER,
  POLLING_INTERVAL_MS,
  MAX_POLLING_ATTEMPTS,
} from "../config";

export async function pollForOffer(token: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
    const res = await fetch(`${SIGNALING_SERVER}/offer/${token}`);
    const data = await res.json();
    if (data.offer) {
      return data.offer;
    }
    await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
  }
  throw new Error("Polling timed out: no offer received after 120 attempts");
}

export async function sendAnswer(token: string, answer: string): Promise<void> {
  await fetch(`${SIGNALING_SERVER}/answer/${token}`, {
    method: "POST",
    body: answer,
  });
}
