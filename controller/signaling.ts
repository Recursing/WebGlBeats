import { SIGNALING_SERVER, POLLING_INTERVAL_MS } from "../config";

export async function sendOffer(token: string, offer: string): Promise<void> {
  await fetch(`${SIGNALING_SERVER}/offer/${token}`, {
    method: "POST",
    body: offer,
  });
}

export async function pollForAnswer(token: string): Promise<string> {
  while (true) {
    const res = await fetch(`${SIGNALING_SERVER}/answer/${token}`);
    const data = await res.json();
    if (data.answer) {
      return data.answer;
    }
    await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
  }
}
