import RoomManager from "../services/room_manager.js";
import store from "./index.js"; // base store
const apiKey = "ak_70cee94cf850485e933771a5d17ea4b1";

const useCommsStore = {
  handleStartCall: async (businessData) => {
    const {
      updateRoomLoadingStatus,
      setRoomManager,
      getState,
      createAndJoinRoom,
      addLocalFeed,
      openCall,
    } = store;

    const { roomManager, user, mainUser, audioEnabled, videoEnabled } = getState();

    try {
      updateRoomLoadingStatus({ loading: true, step: "creating-room" });

      const callerName = user?.name || mainUser || "User";
      const bizName = businessData?.data?.name || "Business";
      const name = `Room initialized by ${callerName} in ${bizName}`;
      const description = `Call created by ${callerName} for ${bizName}.`;

      // 1. Create and join a room
      const res = await createAndJoinRoom({
        name,
        description,
        userName: callerName,
      });

      // 2. Ensure RoomManager exists
      let mgr = roomManager;
      if (!mgr) {
        mgr = new RoomManager();
        setRoomManager(mgr);
      }

      // 3. Connect signaling socket
      await mgr.connectToWebSocket(res.token, apiKey);

      updateRoomLoadingStatus({
        step: "connected-to-socket",
        loading: false,
      });

      // 4. Request local media devices
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      mgr.tempLocalStream = localStream;

      // 5. Add local feed to state
      addLocalFeed({
        id: "local-temp-camera",
        feedId: null,
        userId: user?.id || null,
        userName: callerName,
        feedType: "camera",
        audioEnabled: !!true,
        videoEnabled: !!true,
        handRaised: false,
        stream: localStream,
        isLocal: true,
      });

      // 6. Publish stream as conference feed
      await mgr.joinConferenceAsPublisher({
        feedType: "camera",
        audio: true,
        video: true,
      });

      // 7. Open call UI
      openCall();
      store.setState({ view: "video" });
    } catch (err) {
      console.error("Error starting call:", err);
      updateRoomLoadingStatus({
        loading: false,
        error: err?.message || "Failed to start call",
      });
    }
  },
};

export default useCommsStore;
