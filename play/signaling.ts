import { SIGNALING_SERVER, POLLING_INTERVAL_MS } from "../config";

export async function pollForOffer(token: string): Promise<string> {
  while (true) {
    const res = await fetch(`${SIGNALING_SERVER}/offer/${token}`);
    const data = await res.json();
    if (data.offer) {
      return data.offer;
    }
    await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
  }
}

export async function sendAnswer(token: string, answer: string): Promise<void> {
  await fetch(`${SIGNALING_SERVER}/answer/${token}`, {
    method: "POST",
    body: answer,
  });
}
