// store.js
import {rooms} from "../config/comms_helpers";

function createStore() {
  let state = {
    // Room metadata
    room: null,
    user: null,
    roomManager: null,
    members: [],
    messages: [],
    localFeeds: [],
    remoteFeeds: [],
    conferenceState: {
      step: "pending",
      joinedConference: false,
      joinRequestState: { isLoading: false, error: null },
    },
    peers: new Map(),
    localPeers: [],
    remotePeers: [],
    mediaSession: null,
    mediaRoom: null,
    roomLoadingStatus: {
      loading: false,
      error: null,
      step: "creating-room",
    },
    reactions: [],
    notifications: [],
  };

  let listeners = [];

  function getState() {
    return state;
  }

  function setState(partial) {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  // actions
  const actions = {
    // Room + user
    setRoom: (room) => setState({ room }),
    setUser: (user) => setState({ user }),

    // Members
    setMembers: (members) => setState({ members }),
    addMember: (member) => setState({ members: [...state.members, member] }),
    removeMember: (id) =>
      setState({ members: state.members.filter((m) => m.id !== id) }),
    updateMember: (id, updates) =>
      setState({
        members: state.members.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }),

    // Messages
    setMessages: (messages) => setState({ messages }),
    addMessage: (message) =>
      setState({ messages: [...state.messages, message] }),
    updateMessage: (id, updates) =>
      setState({
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }),
    removeMessagePendingStatus: (tempId, confirmed) =>
      setState({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...confirmed, pending: false } : m
        ),
      }),

    // Local feeds
    setLocalFeeds: (feeds) => setState({ localFeeds: feeds }),
    addLocalFeed: (feed) =>
      setState({ localFeeds: [...state.localFeeds, feed] }),
    removeLocalFeed: (feedId) =>
      setState({
        localFeeds: state.localFeeds.filter(
          (f) => f.feedId !== feedId && f.id !== feedId
        ),
      }),
    updateLocalFeed: (feedId, updates) =>
      setState({
        localFeeds: state.localFeeds.map((f) =>
          f.feedId === feedId || f.id === feedId ? { ...f, ...updates } : f
        ),
      }),

    // Remote feeds
    setRemoteFeeds: (feeds) => setState({ remoteFeeds: feeds }),
    addRemoteFeed: (feed) =>
      setState({ remoteFeeds: [...state.remoteFeeds, feed] }),
    removeRemoteFeed: (feedId) =>
      setState({
        remoteFeeds: state.remoteFeeds.filter((f) => f.feedId !== feedId),
      }),
    updateRemoteFeed: (feedId, updates) =>
      setState({
        remoteFeeds: state.remoteFeeds.map((f) =>
          f.feedId === feedId ? { ...f, ...updates } : f
        ),
      }),

    // Conference
    setConferenceState: (conferenceState) => setState({ conferenceState }),
    updateConferenceState: (updates) =>
      setState({
        conferenceState: { ...state.conferenceState, ...updates },
      }),

    // WebRTC peers
    setPeers: (peers) => setState({ peers }),
    addPeer: (feedId, peerData) => {
      const newPeers = new Map(state.peers);
      newPeers.set(feedId, peerData);
      setState({ peers: newPeers });
    },
    removePeer: (feedId) => {
      const newPeers = new Map(state.peers);
      newPeers.delete(feedId);
      setState({ peers: newPeers });
    },
    updatePeer: (feedId, updates) => {
      const newPeers = new Map(state.peers);
      const existingPeer = newPeers.get(feedId);
      if (existingPeer) {
        newPeers.set(feedId, { ...existingPeer, ...updates });
      }
      setState({ peers: newPeers });
    },

    // Local/remote peers
    setLocalPeers: (peers) => setState({ localPeers: peers }),
    addLocalPeer: (peer) =>
      setState({ localPeers: [...state.localPeers, peer] }),
    removeLocalPeer: (feedId) =>
      setState({
        localPeers: state.localPeers.filter((p) => p.feedId !== feedId),
      }),
    updateLocalPeer: (feedId, updates) =>
      setState({
        localPeers: state.localPeers.map((p) =>
          p.feedId === feedId ? { ...p, ...updates } : p
        ),
      }),

    setRemotePeers: (peers) => setState({ remotePeers: peers }),
    addRemotePeer: (peer) =>
      setState({ remotePeers: [...state.remotePeers, peer] }),
    removeRemotePeer: (feedId) =>
      setState({
        remotePeers: state.remotePeers.filter((p) => p.feedId !== feedId),
      }),
    updateRemotePeer: (feedId, updates) =>
      setState({
        remotePeers: state.remotePeers.map((p) =>
          p.feedId === feedId ? { ...p, ...updates } : p
        ),
      }),

    // Combined feed helpers
    getAllFeeds: () => [...state.localFeeds, ...state.remoteFeeds],
    getFeedByFeedId: (feedId) =>
      [...state.localFeeds, ...state.remoteFeeds].find(
        (f) => f.feedId === feedId
      ),
    getFeedsByUserId: (userId) =>
      [...state.localFeeds, ...state.remoteFeeds].filter(
        (f) => f.userId === userId
      ),

    // Media session
    setMediaSession: (mediaSession) => setState({ mediaSession }),

    // Media room
    setMediaRoom: (mediaRoom) => setState({ mediaRoom }),

    // Room loading
    setRoomLoadingStatus: (status) => setState({ roomLoadingStatus: status }),
    updateRoomLoadingStatus: (updates) =>
      setState({
        roomLoadingStatus: { ...state.roomLoadingStatus, ...updates },
      }),

    // Room manager
    setRoomManager: (roomManager) => setState({ roomManager }),
 // Orchestration (async): create + join
    createAndJoinRoom: async ({ name, description, userName }) => {

      actions.updateRoomLoadingStatus({
        loading: true,
        error: null,
        step: "creating-room",
      });

      const createRes = await rooms.create({ name, description });
      const roomId = createRes?.data?.id || createRes?.id;

      actions.updateRoomLoadingStatus({ step: "joining-room" });
      const joinRes = await rooms.join(roomId, { name: userName });
      const token = joinRes?.data?.token;
      const joinedUser = joinRes?.data?.user;

      const roomRes = await rooms.get(roomId);
      const roomData = roomRes?.data || roomRes;

      const roomInfo = roomData?.room;
      const users = roomData?.users || [];
      const msgs = roomData?.messages || [];

      actions.setRoom({
        id: roomInfo?.id,
        name: roomInfo?.name,
        description: roomInfo?.description,
        hostId: roomInfo?.hostId,
        createdAt: roomInfo?.createdAt,
        updatedAt: roomInfo?.updatedAt,
      });
      actions.setUser({
        id: joinedUser?.id,
        roomId: joinedUser?.roomId,
        name: joinedUser?.name,
        connected: joinedUser?.connected,
        joinedCall: joinedUser?.joinedCall || false,
        createdAt: joinedUser?.createdAt,
        updatedAt: joinedUser?.updatedAt,
        isHost: joinRes?.data?.isHost,
      });
      actions.setMembers(
        users.map((u) => ({
          id: u.id,
          roomId: u.roomId,
          name: u.name,
          connected: u.connected,
          joinedCall: u.joinedCall,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          isHost: u.id === roomInfo?.hostId,
        }))
      );
      actions.setMessages(
        msgs.map((m) => ({
          ...m,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }))
      );

      return { roomId, token };
    },

    
    joinRoomById: async ({ roomId, userName }) => {
      actions.updateRoomLoadingStatus({
        loading: true,
        error: null,
        step: "joining-room",
      });

      const joinRes = await rooms.join(roomId, { name: userName });
      const token = joinRes?.data?.token;
      const joinedUser = joinRes?.data?.user;

      const roomRes = await rooms.get(roomId);
      const roomData = roomRes?.data || roomRes;

      const roomInfo = roomData?.room;
      const users = roomData?.users || [];
      const msgs = roomData?.messages || [];

      actions.setRoom({
        id: roomInfo?.id,
        name: roomInfo?.name,
        description: roomInfo?.description,
        hostId: roomInfo?.hostId,
        createdAt: roomInfo?.createdAt,
        updatedAt: roomInfo?.updatedAt,
      });
      actions.setUser({
        id: joinedUser?.id,
        roomId: joinedUser?.roomId,
        name: joinedUser?.name,
        connected: joinedUser?.connected,
        joinedCall: joinedUser?.joinedCall || false,
        createdAt: joinedUser?.createdAt,
        updatedAt: joinedUser?.updatedAt,
        isHost: joinRes?.data?.isHost,
      });
      actions.setMembers(
        users.map((u) => ({
          id: u.id,
          roomId: u.roomId,
          name: u.name,
          connected: u.connected,
          joinedCall: u.joinedCall,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          isHost: u.id === roomInfo?.hostId,
        }))
      );
      actions.setMessages(
        msgs.map((m) => ({
          ...m,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }))
      );

      return { roomId, token };
    },
    // Reactions
    addReaction: (reaction) =>
      setState({
        reactions: [
          ...state.reactions,
          { ...reaction, id: Date.now() + Math.random() },
        ],
      }),
    removeReaction: (id) =>
      setState({ reactions: state.reactions.filter((r) => r.id !== id) }),

    // Notifications
    addNotification: (notification) =>
      setState({
        notifications: [
          ...state.notifications,
          { ...notification, id: Date.now() + Math.random() },
        ],
      }),
    removeNotification: (id) =>
      setState({
        notifications: state.notifications.filter((n) => n.id !== id),
      }),

    // Reset
    resetStore: () =>
      setState({
        room: null,
        user: null,
        members: [],
        messages: [],
        localFeeds: [],
        remoteFeeds: [],
        conferenceState: {
          step: "pending",
          joinedConference: false,
          joinRequestState: { isLoading: false, error: null },
        },
        peers: new Map(),
        localPeers: [],
        remotePeers: [],
        mediaSession: null,
        mediaRoom: null,
        roomLoadingStatus: {
          loading: false,
          error: null,
          step: "creating-room",
        },
        roomManager: null,
        reactions: [],
        notifications: [],
      }),
  };

  // ✅ Hook-like accessor
  function useStore(selector = (s) => s) {
    return selector(state);
  }

  Object.assign(useStore, { getState, setState, subscribe, ...actions });

  return useStore;
}

// Export singleton
const store = createStore();
export default store;
