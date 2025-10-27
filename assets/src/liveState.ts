import LiveState from "phx-live-state";

// Build WebSocket URL dynamically for dev and prod
const getLiveStateUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/live_state`;
};

export const nodesLiveState = new LiveState({
  url: getLiveStateUrl(),
  topic: "nodes:all"
});
