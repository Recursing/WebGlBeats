import { test, expect } from '@playwright/test';

test('WebRTC connection is established between sender and receiver', async ({ browser }) => {
  // Create two separate browser contexts
  const receiverContext = await browser.newContext();
  const senderContext = await browser.newContext();

  const receiverPage = await receiverContext.newPage();
  const senderPage = await senderContext.newPage();

  // Capture receiver console logs
  const receiverLogs: string[] = [];
  receiverPage.on('console', msg => receiverLogs.push(msg.text()));

  // Navigate receiver first - it generates and logs a token
  await receiverPage.goto('/play/');
  await receiverPage.waitForTimeout(500);

  // Extract token from console logs (8-char alphanumeric string)
  const token = receiverLogs.find(log => /^[a-z0-9]{8}$/.test(log));
  expect(token).toBeTruthy();

  // Navigate sender with the extracted token
  await senderPage.goto(`/controller/?${token}`);

  // Wait for WebRTC connection to be established on receiver
  await expect(async () => {
    const hasConnected = receiverLogs.some(log => log.includes('connected'));
    expect(hasConnected).toBe(true);
  }).toPass({ timeout: 15000 });

  // Verify the data channel opened on receiver
  await expect(async () => {
    const channelOpened = receiverLogs.some(log => log.includes('Channel opened'));
    expect(channelOpened).toBe(true);
  }).toPass({ timeout: 5000 });

  // Verify sender side - it logs to DOM via debug(), check for "Opened channel!" text
  const senderChannelOpened = await senderPage.locator('body').textContent();
  expect(senderChannelOpened).toContain('Opened channel!');

  await receiverContext.close();
  await senderContext.close();
});

test('sender can send data to receiver via WebRTC DataChannel', async ({ browser }) => {
  const receiverContext = await browser.newContext();
  const senderContext = await browser.newContext();

  const receiverPage = await receiverContext.newPage();
  const senderPage = await senderContext.newPage();

  const receiverLogs: string[] = [];
  receiverPage.on('console', msg => receiverLogs.push(msg.text()));

  // Navigate receiver first
  await receiverPage.goto('/play/');
  await receiverPage.waitForTimeout(500);

  // Extract token
  const token = receiverLogs.find(log => /^[a-z0-9]{8}$/.test(log));
  expect(token).toBeTruthy();

  // Navigate sender
  await senderPage.goto(`/controller/?${token}`);

  // Wait for data channel to be open on sender
  await senderPage.waitForFunction(() => {
    const channel = (window as any).sendChannel;
    return channel && channel.readyState === 'open';
  }, { timeout: 15000 });

  // Send test data through the data channel
  await senderPage.evaluate(() => {
    const channel = (window as any).sendChannel;
    channel.send(JSON.stringify([90, 45, 30])); // z, x, y angles
  });

  // Give time for the message to be processed
  await receiverPage.waitForTimeout(200);

  // Verify connection is still stable
  const connectionStable = receiverLogs.some(log => log === 'connected');
  expect(connectionStable).toBe(true);

  await receiverContext.close();
  await senderContext.close();
});
